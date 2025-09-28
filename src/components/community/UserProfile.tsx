import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MessageCircle, Heart, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CommentSystem from "./CommentSystem";
import DOMPurify from "dompurify";

interface Profile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  coins?: number;
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
  post_title: string;
  post_id: string;
}

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Load user's posts
      const { data: postsData } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsData) {
        setPosts(postsData);
      }

      // Load user's comments with post titles
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          post_id,
          community_posts!inner(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (commentsData) {
        const formattedComments = commentsData.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          post_id: comment.post_id,
          post_title: (comment as any).community_posts.title
        }));
        setComments(formattedComments);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatContent = (htmlContent: string): string => {
    // Sanitize HTML and strip tags while preserving line breaks
    const sanitized = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    
    // Convert HTML to formatted text
    let formattedText = tempDiv.textContent || tempDiv.innerText || '';
    
    // If there are paragraph tags, preserve paragraph breaks
    if (sanitized.includes('<p>')) {
      const paragraphs = sanitized.split(/<\/p>\s*<p[^>]*>/);
      formattedText = paragraphs
        .map(p => p.replace(/<[^>]+>/g, '').trim())
        .filter(p => p.length > 0)
        .join('\n\n');
    } else {
      // Replace <br> tags with line breaks
      formattedText = sanitized.replace(/<br\s*\/?>/gi, '\n');
      // Remove any remaining HTML tags
      formattedText = formattedText.replace(/<[^>]+>/g, '');
    }
    
    // Clean up extra whitespace while preserving intentional line breaks
    formattedText = formattedText.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    return formattedText;
  };

  const PostWithComments = ({ post }: { post: Post }) => {
    const [showComments, setShowComments] = useState(false);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            in {post.channel} • {new Date(post.created_at).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line mb-4 text-muted-foreground">
            {formatContent(post.content)}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post.likes_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.comments_count}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-sm"
            >
              {showComments ? 'Hide' : 'Show'} Comments
            </Button>
          </div>
          
          {showComments && (
            <div className="border-t pt-4">
              <CommentSystem postId={post.id} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
            <Link to="/community">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Community
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/community">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback className="text-xl">
                  {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-muted-foreground mb-4">@{profile.username}</p>
                
                {profile.bio && (
                  <p className="text-foreground mb-4">{profile.bio}</p>
                )}
                
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                  <div>{posts.length} Posts</div>
                  <div>{comments.length} Comments</div>
                </div>
                
                {profile.coins !== undefined && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {profile.coins} Wellness Coins
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostWithComments key={post.id} post={post} />
              ))
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">No posts yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Comment on: <strong>{comment.post_title}</strong>
                    </p>
                    <div className="whitespace-pre-line mb-2">{formatContent(comment.content)}</div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">No comments yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;