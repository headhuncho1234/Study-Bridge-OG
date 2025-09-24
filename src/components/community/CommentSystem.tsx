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
}

const CommentSystem = ({ postId }: CommentSystemProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner(username, display_name, avatar_url)
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
          profile: (comment as any).profiles,
          replies: []
        };
        commentMap.set(comment.id, formattedComment);

        if (!comment.parent_comment_id) {
          rootComments.push(formattedComment);
        }
      });

      // Add replies to their parent comments
      data?.forEach(comment => {
        if (comment.parent_comment_id) {
          const parent = commentMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies.push(commentMap.get(comment.id));
          }
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (parentId?: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

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

      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully."
      });

      loadComments();
      
      // Update post comment count
      await supabase.rpc('increment_comment_count', { post_id: postId });
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (commentId: string, isLike: boolean) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

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

      loadComments();
    } catch (error) {
      console.error('Error handling like:', error);
    }
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
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
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
          <Button
            onClick={() => handleSubmitComment()}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default CommentSystem;