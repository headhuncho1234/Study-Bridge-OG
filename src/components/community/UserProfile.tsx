import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Calendar, User, Coins, Edit, Home, ArrowLeft, Bot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import CommentSystem from "./CommentSystem";
import ChatHistoryTab from "./ChatHistoryTab";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  coins: number | null;
  created_at: string;
  updated_at: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  channel: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  community_posts: {
    title: string;
  };
}

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfile(userId);
      
      // Set up real-time subscriptions for user's posts and comments
      const postsSubscription = supabase
        .channel(`user_posts_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'community_posts',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadProfile(userId);
          }
        )
        .subscribe();

      const commentsSubscription = supabase
        .channel(`user_comments_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `user_id=eq.${userId}`
          },
          () => {
            loadProfile(userId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postsSubscription);
        supabase.removeChannel(commentsSubscription);
      };
    }
  }, [userId]);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Load user's posts
      const { data: postsData } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);

      // Load user's comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          post_id,
          community_posts:post_id (
            title
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);

    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (content: string) => {
    // Remove HTML tags and format content for display
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\\n/g, '\n') // Convert escaped newlines
      .split('\n')
      .map((line, index) => (
        <span key={index}>
          {line}
          {index < content.split('\n').length - 1 && <br />}
        </span>
      ));
  };

  // Component to display individual posts with comments
  const PostWithComments = ({ post }: { post: Post }) => {
    const [showComments, setShowComments] = useState(false);

    return (
      <Card key={post.id} className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <Badge variant="outline">{post.channel}</Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm">
            {formatContent(post.content)}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likes_count}
              </span>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 hover:text-primary"
              >
                <MessageSquare className="h-4 w-4" />
                {post.comments_count} comments
              </button>
            </div>
          </div>

          {showComments && (
            <div className="mt-4 pt-4 border-t">
              <CommentSystem postId={post.id} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The user profile you're looking for doesn't exist.
        </p>
        <Link to="/community">
          <Button>Back to Community</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 mb-2">
        <Link to="/community">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Community</span>
            <span className="sm:hidden">Community</span>
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Go to Home</span>
            <span className="sm:hidden">Home</span>
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-xl">
                  {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
                {profile.bio && (
                  <p className="text-muted-foreground mt-1 whitespace-pre-line">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-accent" />
                    {profile.coins || 0} Wellness Coins
                  </span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Link to="/profile/edit">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="chats" className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              Chat History
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostWithComments key={post.id} post={post} />)
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't created any posts yet. Share your thoughts with the community!" 
                    : "This user hasn't created any posts yet."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      to={`/community?expanded=${comment.post_id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Commented on: {comment.community_posts?.title || 'Unknown Post'}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    {formatContent(comment.content)}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile 
                    ? "You haven't made any comments yet. Join the conversation!" 
                    : "This user hasn't made any comments yet."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="chats" className="space-y-4">
            <ChatHistoryTab userId={userId!} isOwnProfile={isOwnProfile} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfile;