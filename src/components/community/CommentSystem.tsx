import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";
import FollowThreadButton from "./FollowThreadButton";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  dislikes_count: number;
  parent_comment_id?: string;
  profile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

interface CommentSystemProps {
  postId: string;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const CommentSystem = ({ postId, isExpanded = false, onToggleExpanded }: CommentSystemProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
    
    // Set up real-time subscription for comments
    const commentsSubscription = supabase
      .channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          console.log('Comment change received:', payload);
          loadComments(); // Reload comments when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [postId]);

  const loadComments = async () => {
    if (isLoading) return; // Prevent duplicate loading
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(username, display_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into a tree structure
      const commentMap = new Map();
      const rootComments: Comment[] = [];

      data?.forEach(comment => {
        const formattedComment = {
          ...comment,
          profile: (comment as any).profiles || {
            username: 'Anonymous',
            display_name: 'Anonymous User',
            avatar_url: null
          },
          replies: []
        };
        commentMap.set(comment.id, formattedComment);

        if (!comment.parent_comment_id) {
          rootComments.push(formattedComment);
        }
      });

      // Add replies to their parent comments recursively
      const addRepliesToParent = (parentId: string) => {
        data?.forEach(comment => {
          if (comment.parent_comment_id === parentId) {
            const parent = commentMap.get(parentId);
            const child = commentMap.get(comment.id);
            if (parent && child) {
              parent.replies.push(child);
              // Recursively add nested replies
              addRepliesToParent(comment.id);
            }
          }
        });
      };

      // Build the tree starting from root comments
      rootComments.forEach(comment => {
        addRepliesToParent(comment.id);
      });

      setComments(rootComments);
      
      // Auto-expand all comments that have replies
      const newExpanded = new Set<string>();
      const expandCommentsWithReplies = (comments: Comment[]) => {
        comments.forEach(comment => {
          if (comment.replies && comment.replies.length > 0) {
            newExpanded.add(comment.id);
            expandCommentsWithReplies(comment.replies);
          }
        });
      };
      expandCommentsWithReplies(rootComments);
      setExpandedComments(newExpanded);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error loading comments",
        description: "Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          parent_comment_id: parentId || null,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Clear input fields
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }

      // Reload comments to get the new one with proper profile data
      await loadComments();

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully."
      });
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, isLike: boolean) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Optimistic update for immediate feedback
    setComments(prevComments => 
      prevComments.map(comment => updateCommentLike(comment, commentId, isLike))
    );

    try {
      // Check if user already liked/disliked this comment
      const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        if (existingLike.is_like === isLike) {
          // Remove the like/dislike
          await supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id);
        } else {
          // Update the like/dislike
          await supabase
            .from('likes')
            .update({ is_like: isLike })
            .eq('id', existingLike.id);
        }
      } else {
        // Create new like/dislike
        await supabase
          .from('likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            is_like: isLike
          });
      }

    } catch (error) {
      console.error('Error handling like:', error);
      // Revert optimistic update on error
      loadComments();
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateCommentLike = (comment: Comment, commentId: string, isLike: boolean): Comment => {
    if (comment.id === commentId) {
      return {
        ...comment,
        likes_count: isLike ? (comment.likes_count || 0) + 1 : (comment.likes_count || 0),
        dislikes_count: !isLike ? (comment.dislikes_count || 0) + 1 : (comment.dislikes_count || 0)
      };
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: comment.replies.map(reply => updateCommentLike(reply, commentId, isLike))
      };
    }
    return comment;
  };

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={comment.profile?.avatar_url || ""} />
              <AvatarFallback>
                {(comment.profile?.display_name || comment.profile?.username || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">
                  {comment.profile?.display_name || comment.profile?.username || "Anonymous"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <p className="whitespace-pre-line mb-3">{comment.content}</p>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id, true)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {comment.likes_count || 0}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-muted-foreground"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                
                {comment.replies && comment.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(comment.id)}
                    className="text-muted-foreground"
                  >
                    {expandedComments.has(comment.id) ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-4 ml-12">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleSubmitComment(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Reply"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {comment.replies && expandedComments.has(comment.id) && (
        <div className="space-y-2">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Comments List - Always visible */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          <>
            <h4 className="font-semibold text-sm text-muted-foreground">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h4>
            <div className="space-y-3">
              {/* Show first 2 comments by default, rest when expanded */}
              {(isExpanded ? comments : comments.slice(0, 2)).map(comment => renderComment(comment))}
              
              {!isExpanded && comments.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpanded}
                  className="text-muted-foreground hover:text-primary"
                >
                  Show {comments.length - 2} more comments
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        )}
      </div>

      {/* Expanded view with comment form and follow button */}
      {isExpanded && (
        <>
          {/* Follow Thread Button */}
          <div className="flex justify-end">
            <FollowThreadButton postId={postId} />
          </div>

          {/* New Comment Form */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-4">Add a comment</h3>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmitComment()}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Comment"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onToggleExpanded}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default CommentSystem;