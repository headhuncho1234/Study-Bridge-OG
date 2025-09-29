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
    
    const postsSubscription = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'community_posts' 
        },
        (payload) => {
          console.log('New post added:', payload);
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'community_posts' 
        },
        (payload) => {
          console.log('Post updated:', payload);
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === payload.new.id 
                ? { ...post, likes: payload.new.likes_count || 0, dislikes: payload.new.dislikes_count || 0, comments: payload.new.comments_count || 0 }
                : post
            )
          );
        }
      )
      .subscribe();

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
          console.log('Like change received:', payload);
          if (user) {
            loadUserLikes();
          }
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(likesSubscription);
    };
  }, [user]);

  useEffect(() => {
    const channel = searchParams.get('channel');
    if (channel && channels.find(c => c.id === channel)) {
      setActiveChannel(channel);
    }
  }, [searchParams]);

  const loadPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error loading posts:', postsError);
        toast({
          title: "Connection Error",
          description: "Unable to load posts. Please check your internet connection and try again.",
          variant: "destructive"
        });
        setPosts([]);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      const userIds = [...new Set(postsData.map(post => post.user_id))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.user_id, profile);
        });
      }

      const formattedPosts = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        return {
          id: post.id,
          title: post.title,
          content: post.content,
          user_id: post.user_id,
          author: profile?.display_name || profile?.username || 'Anonymous User',
          authorAvatar: profile?.avatar_url || '',
          date: new Date(post.created_at).toLocaleDateString(),
          likes: post.likes_count || 0,
          dislikes: post.dislikes_count || 0,
          comments: post.comments_count || 0,
          tags: [],
          images: post.images || [],
          channel: post.channel || 'general',
          profile: profile
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error Loading Posts",
        description: "Something went wrong while loading community posts. Please refresh the page.",
        variant: "destructive"
      });
      setPosts([]);
    }
  };

  const loadUserLikes = async () => {
    if (!user) return;
    
    try {
      const { data: likes, error } = await supabase
        .from('likes')
        .select('id, post_id, comment_id, is_like')
        .eq('user_id', user.id);

      if (error) throw error;

      const likesMap = new Map();
      likes?.forEach(like => {
        if (like.post_id) {
          likesMap.set(like.post_id, { isLike: like.is_like, id: like.id });
        }
      });
      setUserLikes(likesMap);
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  };

  const popularTags = ["tips", "scholarships", "housing", "visa", "university-life", "success-story"];

  const handleCreatePost = async (newPost: Omit<Post, 'id' | 'date' | 'likes' | 'comments'>) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          title: newPost.title,
          content: newPost.content,
          images: newPost.images,
          channel: newPost.channel,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with the community.",
      });

      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (postId: string, isLike: boolean) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const currentLike = userLikes.get(postId);
    
    // Optimistic UI update
    const newUserLikes = new Map(userLikes);
    if (currentLike?.isLike === isLike) {
      // User is removing their like/dislike
      newUserLikes.delete(postId);
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                [isLike ? 'likes' : 'dislikes']: Math.max(0, post[isLike ? 'likes' : 'dislikes'] - 1)
              }
            : post
        )
      );
    } else {
      // User is adding a new like/dislike or switching
      newUserLikes.set(postId, { isLike, id: currentLike?.id || '' });
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            let newLikes = post.likes;
            let newDislikes = post.dislikes;
            
            if (currentLike) {
              // Remove previous like/dislike
              if (currentLike.isLike) {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            }
            
            // Add new like/dislike
            if (isLike) {
              newLikes += 1;
            } else {
              newDislikes += 1;
            }
            
            return { ...post, likes: newLikes, dislikes: newDislikes };
          }
          return post;
        })
      );
    }
    setUserLikes(newUserLikes);

    try {
      if (currentLike) {
        if (currentLike.isLike === isLike) {
          // Remove the like/dislike
          await supabase
            .from('likes')
            .delete()
            .eq('id', currentLike.id);
        } else {
          // Update the like/dislike
          await supabase
            .from('likes')
            .update({ is_like: isLike })
            .eq('id', currentLike.id);
        }
      } else {
        // Create new like/dislike
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            is_like: isLike
          });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      // Revert optimistic update on error
      loadUserLikes();
      loadPosts();
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    const matchesChannel = post.channel === activeChannel;
    return matchesSearch && matchesTag && matchesChannel;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'mostActive':
        return b.comments - a.comments;
      case 'topLiked':
        return b.likes - a.likes;
      case 'newest':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const handleChannelChange = (channel: string) => {
    setActiveChannel(channel);
    setSearchParams({ channel });
    setSearchQuery("");
    setSelectedTag("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Student Community
              </h1>
              <p className="text-muted-foreground">
                Connect, share experiences, and support each other
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-card transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
            
            {user && (
              <Button
                variant="outline"
                onClick={() => setIsProfileEditOpen(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Channel Navigation */}
        <Tabs value={activeChannel} onValueChange={handleChannelChange} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7">
            {channels.map((channel) => (
              <TabsTrigger 
                key={channel.id} 
                value={channel.id}
                className="flex items-center gap-2 text-xs md:text-sm"
              >
                {channel.icon}
                <span className="hidden sm:inline">{channel.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {channels.map((channel) => (
            <TabsContent key={channel.id} value={channel.id}>
              {/* Search, Filters and Sort */}
              <div className="grid md:grid-cols-5 gap-6 mb-8">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Input
                      placeholder={`Search ${channel.name.toLowerCase()} posts...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedTag === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTag("")}
                    >
                      All
                    </Button>
                    {popularTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTag(tag)}
                        className="text-xs"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-1">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">
                        <div className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Newest
                        </div>
                      </SelectItem>
                      <SelectItem value="mostActive">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Most Active
                        </div>
                      </SelectItem>
                      <SelectItem value="topLiked">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Top Liked
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-6">
                {sortedPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleUserClick(post.user_id)}
                          >
                            <AvatarImage src={post.authorAvatar} />
                            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                          </Avatar>
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
                            {post.comments}
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
                      
                      {expandedPost === post.id && (
                        <div className="mt-6 pt-6 border-t">
                          <CommentSystem postId={post.id} />
                        </div>
                      )}
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