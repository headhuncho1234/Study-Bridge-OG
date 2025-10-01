import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, ChevronDown, ChevronUp, ImagePlus, X, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";
import FollowThreadButton from "./FollowThreadButton";
import { uploadMultipleImages } from "@/utils/imageUpload";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  dislikes_count: number;
  parent_comment_id?: string;
  images?: string[];
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
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [commentImagePreviews, setCommentImagePreviews] = useState<string[]>([]);
  const [replyImages, setReplyImages] = useState<File[]>([]);
  const [replyImagePreviews, setReplyImagePreviews] = useState<string[]>([]);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
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
      // Fetch comments first
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error loading comments:', commentsError);
        toast({
          title: "Error loading comments",
          description: "Please refresh the page.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      
      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      // Create a map of profiles by user_id
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Organize comments into a tree structure
      const commentMap = new Map();
      const rootComments: Comment[] = [];

      commentsData.forEach(comment => {
        const profile = profilesMap.get(comment.user_id);
        
        const formattedComment = {
          ...comment,
          profile: profile || {
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
        commentsData.forEach(comment => {
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
    const images = parentId ? replyImages : commentImages;
    
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadMultipleImages(images, user.id);
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          parent_comment_id: parentId || null,
          user_id: user.id,
          content: content.trim(),
          images: imageUrls
        });

      if (error) throw error;

      // Clear input fields
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
        replyImagePreviews.forEach(url => URL.revokeObjectURL(url));
        setReplyImages([]);
        setReplyImagePreviews([]);
      } else {
        setNewComment("");
        commentImagePreviews.forEach(url => URL.revokeObjectURL(url));
        setCommentImages([]);
        setCommentImagePreviews([]);
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
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      if (isReply) {
        setReplyImages(newFiles);
      } else {
        setCommentImages(newFiles);
      }
      
      // Generate preview URLs
      const previews = newFiles.map(file => URL.createObjectURL(file));
      
      if (isReply) {
        setReplyImagePreviews(previews);
      } else {
        setCommentImagePreviews(previews);
      }
    }
  };

  const removeCommentImage = (index: number, isReply: boolean) => {
    if (isReply) {
      const newFiles = replyImages.filter((_, i) => i !== index);
      const newPreviews = replyImagePreviews.filter((_, i) => i !== index);
      
      if (replyImagePreviews[index]) {
        URL.revokeObjectURL(replyImagePreviews[index]);
      }
      
      setReplyImages(newFiles);
      setReplyImagePreviews(newPreviews);
    } else {
      const newFiles = commentImages.filter((_, i) => i !== index);
      const newPreviews = commentImagePreviews.filter((_, i) => i !== index);
      
      if (commentImagePreviews[index]) {
        URL.revokeObjectURL(commentImagePreviews[index]);
      }
      
      setCommentImages(newFiles);
      setCommentImagePreviews(newPreviews);
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been removed successfully.",
      });

      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error deleting comment",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setDeleteCommentId(null);
    }
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
              
              {comment.images && comment.images.length > 0 && (
                <div className={`grid gap-2 mb-3 ${
                  comment.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}>
                  {comment.images.map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={image}
                      alt={`Comment image ${imgIndex + 1}`}
                      className="rounded-lg object-cover w-full max-h-48 cursor-pointer hover:scale-[1.02] transition-transform"
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </div>
              )}
              
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
                
                {user?.id === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteCommentId(comment.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
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
              
              <div className="mb-2">
                <label htmlFor={`reply-image-${comment.id}`} className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <ImagePlus className="h-4 w-4" />
                  Attach images
                </label>
                <Input
                  id={`reply-image-${comment.id}`}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageChange(e, true)}
                  className="hidden"
                />
              </div>
              
              {replyImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {replyImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeCommentImage(index, true)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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
                    replyImagePreviews.forEach(url => URL.revokeObjectURL(url));
                    setReplyImages([]);
                    setReplyImagePreviews([]);
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
              
              <div className="mb-4">
                <label htmlFor="comment-image" className="cursor-pointer inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <ImagePlus className="h-4 w-4" />
                  Attach images
                </label>
                <Input
                  id="comment-image"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageChange(e, false)}
                  className="hidden"
                />
              </div>
              
              {commentImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {commentImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeCommentImage(index, false)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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

      <AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone and will also delete all replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCommentId && handleDeleteComment(deleteCommentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommentSystem;