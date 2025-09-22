import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Heart, MessageCircle, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";

// Using default import for CreatePostModal
import CreatePostModal from "@/components/community/CreatePostModal";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  date: string;
  likes: number;
  comments: number;
  tags: string[];
  images?: string[];
}

const Community = () => {
  // State declarations
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPosts = data?.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: 'Anonymous User',
        authorAvatar: '',
        date: new Date(post.created_at).toLocaleDateString(),
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        tags: [],
        images: post.images || []
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to sample posts
      const samplePosts: Post[] = [
        {
          id: "1",
          title: "First Week at University of Michigan - Tips for International Students",
          content: "Just finished my first week at UMich! Here are some tips for fellow international students...",
          author: "Sarah Chen",
          authorAvatar: "",
          date: "2024-01-15",
          likes: 24,
          comments: 8,
          tags: ["tips", "university-life", "international"],
          images: []
        },
        {
          id: "2", 
          title: "Scholarship Success Story - $25k Merit Award",
          content: "I'm excited to share that I received a $25,000 merit scholarship! Here's how I did it...",
          author: "David Kim",
          authorAvatar: "",
          date: "2024-01-14",
          likes: 156,
          comments: 32,
          tags: ["scholarships", "success-story"],
          images: []
        }
      ];
      setPosts(samplePosts);
    }
  };

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

  const popularTags = ["tips", "scholarships", "housing", "visa", "university-life", "success-story"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

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
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-3">
            <div className="relative">
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="md:col-span-1">
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
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {post.author} • {post.date}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.content}
                </p>
                
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
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedTag 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to share your experience with the community!"
                }
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
                Create Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default Community;