import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/auth/AuthModal";

interface FollowThreadButtonProps {
  postId: string;
}

const FollowThreadButton = ({ postId }: FollowThreadButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkFollowStatus();
  }, [postId, user]);

  const checkFollowStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('followed_threads')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      setIsFollowing(!!data);
    } catch (error) {
      // User is not following this thread
      setIsFollowing(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followed_threads')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Unfollowed thread",
          description: "You will no longer receive notifications for this thread."
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followed_threads')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: "Following thread",
          description: "You will be notified of new comments on this thread."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFollow}
        disabled={loading}
        className={`text-muted-foreground ${isFollowing ? 'text-primary' : ''}`}
      >
        {isFollowing ? (
          <BellOff className="h-4 w-4 mr-1" />
        ) : (
          <Bell className="h-4 w-4 mr-1" />
        )}
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default FollowThreadButton;