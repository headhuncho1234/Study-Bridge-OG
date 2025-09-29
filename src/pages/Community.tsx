import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Heart, MessageCircle, Share2, Home, GraduationCap, Heart as WellnessIcon, DollarSign, FileText, Briefcase, ThumbsDown, Eye, TrendingUp, Settings, User, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import DOMPurify from "dompurify";
import CommentSystem from "@/components/community/CommentSystem";
import ProfileEditModal from "@/components/community/ProfileEditModal";
import CreatePostModal from "@/components/community/CreatePostModal";
import WhoLikedSection from "@/components/community/WhoLikedSection";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  author: string;
  authorAvatar: string;
  date: string;
  likes: number;
  dislikes: number;
  comments: number;
  tags: string[];
  images?: string[];
  channel: string;
  profile?: {
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

const sanitizeAndFormatContent = (htmlContent: string): string => {
  const sanitized = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitized;
  
  let formattedText = tempDiv.textContent || tempDiv.innerText || '';
  
  if (sanitized.includes('<p>')) {
    const paragraphs = sanitized.split(/<\/p>\s*<p[^>]*>/);
    formattedText = paragraphs
      .map(p => p.replace(/<[^>]+>/g, '').trim())
      .filter(p => p.length > 0)
      .join('\n\n');
  } else {
    formattedText = sanitized.replace(/<br\s*\/?>/gi, '\n');
    formattedText = formattedText.replace(/<[^>]+>/g, '');
  }
  
  formattedText = formattedText.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  return formattedText;
};

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeChannel, setActiveChannel] = useState(searchParams.get('channel') || 'general');
  const [sortBy, setSortBy] = useState("newest");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<Map<string, { isLike: boolean; id: string }>>(new Map());
  const [showWhoLiked, setShowWhoLiked] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const channels = [
    { id: 'general', name: 'General Student Life', icon: <Home className="h-4 w-4" /> },
    { id: 'housing', name: 'Housing', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'roommates', name: 'Roommates', icon: <Users className="h-4 w-4" /> },
    { id: 'wellness', name: 'Wellness', icon: <WellnessIcon className="h-4 w-4" /> },
    { id: 'scholarships', name: 'Scholarships', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'visa', name: 'Visa', icon: <FileText className="h-4 w-4" /> },
    { id: 'career', name: 'Career/Internships', icon: <Briefcase className="h-4 w-4" /> },
  ];

  useEffect(() => {
    loadPosts();
    if (user) {
      loadUserLikes();
    }
    
    // Set up real-time subscription for posts
    const postsSubscription = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        (payload) => {
          console.log('Post change received:', payload);
          loadPosts(); // Reload posts when changes occur
        }
      )
      .subscribe();

    // Set up real-time subscription for likes
    const likesSubscription = supabase
      .channel('likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('Likes change received:', payload);
          loadPosts(); // Reload posts to get updated like counts
          if (user) {
            loadUserLikes(); // Reload user likes
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!inner(username, display_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data?.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        user_id: post.user_id,
        author: (post as any).profiles?.display_name || (post as any).profiles?.username || 'Unknown User',
        authorAvatar: (post as any).profiles?.avatar_url || '',
        date: new Date(post.created_at).toLocaleDateString(),
        likes: post.likes_count || 0,
        dislikes: post.dislikes_count || 0,
        comments: post.comments_count || 0,
        tags: [],
        images: post.images || [],
        channel: post.channel,
        profile: (post as any).profiles
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    }
  };

  const loadUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id, post_id, is_like')
        .eq('user_id', user.id)
        .not('post_id', 'is', null);

      if (error) throw error;

      const likesMap = new Map();
      data?.forEach(like => {
        if (like.post_id) {
          likesMap.set(like.post_id, { isLike: like.is_like, id: like.id });
        }
      });
      setUserLikes(likesMap);
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);
    const matchesChannel = post.channel === activeChannel;
    
    return matchesSearch && matchesTag && matchesChannel;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.likes + b.comments) - (a.likes + a.comments);
      case "oldest":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "newest":
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'date' | 'likes' | 'comments'>) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title: postData.title,
          content: postData.content,
          user_id: user.id,
          channel: postData.channel,
          images: postData.images || []
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your post has been created successfully.",
      });

      // Reload posts to get the new post with proper formatting
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (postId: string, isLike: boolean) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const existingLike = userLikes.get(postId);
      
      if (existingLike) {
        if (existingLike.isLike === isLike) {
          // Remove like/dislike
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('id', existingLike.id);

          if (error) throw error;
          
          // Update local state optimistically
          const newLikes = new Map(userLikes);
          newLikes.delete(postId);
          setUserLikes(newLikes);
        } else {
          // Update existing like/dislike
          const { error } = await supabase
            .from('likes')
            .update({ is_like: isLike })
            .eq('id', existingLike.id);

          if (error) throw error;
          
          // Update local state optimistically  
          const newLikes = new Map(userLikes);
          newLikes.set(postId, { ...existingLike, isLike });
          setUserLikes(newLikes);
        }
      } else {
        // Create new like/dislike
        const { data, error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId,
            is_like: isLike
          })
          .select()
          .single();

        if (error) throw error;
        
        // Update local state optimistically
        const newLikes = new Map(userLikes);
        newLikes.set(postId, { isLike, id: data.id });
        setUserLikes(newLikes);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleChannelChange = (newChannel: string) => {
    setActiveChannel(newChannel);
    setSearchParams({ channel: newChannel });
    setExpandedPost(null); // Reset expanded post when switching channels
    setShowWhoLiked(null); // Reset who liked display
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Student Community</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsProfileEditOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Channel Tabs */}
        <Tabs value={activeChannel} onValueChange={handleChannelChange} className="space-y-8">
          <TabsList className="grid grid-cols-7 gap-1 h-auto p-1 bg-muted/50">
            {channels.map((channel) => (
              <TabsTrigger 
                key={channel.id} 
                value={channel.id}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {channel.icon}
                <span className="hidden sm:inline">{channel.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {channels.map((channel) => (
            <TabsContent key={channel.id} value={channel.id} className="space-y-6">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-80"
                  />
                  
                  {allTags.length > 0 && (
                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All tags</SelectItem>
                        {allTags.map(tag => (
                          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Posts */}
              <div className="space-y-6">
                {sortedPosts.map((post) => (
                  <Card key={post.id} className="transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback>
                            {post.author.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div>
                            <h3 className="font-semibold text-lg">{post.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              by{" "}
                              <span 
                                className="hover:underline cursor-pointer font-medium"
                                onClick={() => handleUserClick(post.user_id)}
                              >
                                {post.author}
                              </span>{" "}
                              • {post.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="text-muted-foreground mb-4 line-clamp-3 whitespace-pre-line">
                        {sanitizeAndFormatContent(post.content)}
                      </div>
                      
                      {post.images && post.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Post image ${index + 1}`}
                              className="rounded-lg object-cover aspect-square"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id, true)}
                            className={`transition-colors ${
                              userLikes.get(post.id)?.isLike === true 
                                ? "text-red-500 hover:text-red-600" 
                                : "text-muted-foreground hover:text-red-500"
                            }`}
                          >
                            <Heart 
                              className={`h-4 w-4 mr-1 ${
                                userLikes.get(post.id)?.isLike === true ? "fill-current" : ""
                              }`} 
                            />
                            {post.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id, false)}
                            className={`transition-colors ${
                              userLikes.get(post.id)?.isLike === false 
                                ? "text-blue-500 hover:text-blue-600" 
                                : "text-muted-foreground hover:text-blue-500"
                            }`}
                          >
                            <ThumbsDown 
                              className={`h-4 w-4 mr-1 ${
                                userLikes.get(post.id)?.isLike === false ? "fill-current" : ""
                              }`} 
                            />
                            {post.dislikes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments} Comments
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowWhoLiked(showWhoLiked === post.id ? null : post.id)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Who liked
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                      
                      {showWhoLiked === post.id && (
                        <div className="mt-6 pt-6 border-t">
                          <WhoLikedSection postId={post.id} onClose={() => setShowWhoLiked(null)} />
                        </div>
                      )}
                      
                      {/* Always show comments - no conditional rendering */}
                      <div className="mt-6 pt-6 border-t">
                        <CommentSystem 
                          postId={post.id} 
                          isExpanded={expandedPost === post.id}
                          onToggleExpanded={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {sortedPosts.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts in this channel yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share something with the {channel.name.toLowerCase()} community!
                    </p>
                    <Button 
                      onClick={() => {
                        if (!user) {
                          setIsAuthModalOpen(true);
                        } else {
                          setIsCreateModalOpen(true);
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Modals */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
          defaultChannel={activeChannel}
          channels={channels}
        />

        <ProfileEditModal 
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
        />

        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Community;