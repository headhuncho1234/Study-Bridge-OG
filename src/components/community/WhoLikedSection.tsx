import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Heart, ThumbsDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Like {
  id: string;
  is_like: boolean;
  user_id: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface WhoLikedSectionProps {
  postId: string;
  onClose: () => void;
}

const WhoLikedSection = ({ postId, onClose }: WhoLikedSectionProps) => {
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLikes();
  }, [postId]);

  const loadLikes = async () => {
    try {
      setLoading(true);
      
      // First get likes
      const { data: likesData, error: likesError } = await supabase
        .from('likes')
        .select('id, is_like, user_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (likesError) throw likesError;
      
      if (!likesData || likesData.length === 0) {
        setLikes([]);
        return;
      }
      
      // Get unique user IDs
      const userIds = [...new Set(likesData.map(like => like.user_id))];
      
      // Get profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;
      
      // Create a map of profiles by user_id
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      // Combine likes with profiles
      const likesWithProfiles = likesData.map(like => ({
        ...like,
        profiles: profilesMap.get(like.user_id) || {
          username: 'Unknown User',
          display_name: null,
          avatar_url: null
        }
      }));
      
      setLikes(likesWithProfiles);
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  const likesList = likes.filter(like => like.is_like === true);
  const dislikesList = likes.filter(like => like.is_like === false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Who Interacted</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {likesList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                  <span className="font-medium">Likes ({likesList.length})</span>
                </div>
                <div className="space-y-2">
                  {likesList.map((like) => (
                    <div
                      key={like.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleUserClick(like.user_id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={like.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          {(like.profiles?.display_name || like.profiles?.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {like.profiles?.display_name || like.profiles?.username}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        <Heart className="h-3 w-3 text-red-500 fill-current" />
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dislikesList.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown className="h-4 w-4 text-blue-500 fill-current" />
                  <span className="font-medium">Dislikes ({dislikesList.length})</span>
                </div>
                <div className="space-y-2">
                  {dislikesList.map((like) => (
                    <div
                      key={like.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleUserClick(like.user_id)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={like.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          {(like.profiles?.display_name || like.profiles?.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {like.profiles?.display_name || like.profiles?.username}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        <ThumbsDown className="h-3 w-3 text-blue-500 fill-current" />
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {likes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No likes or reactions yet.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhoLikedSection;