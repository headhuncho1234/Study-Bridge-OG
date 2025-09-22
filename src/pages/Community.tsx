import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Flag, 
  TrendingUp,
  Pin,
  Filter,
  Home
} from "lucide-react";
import CreatePostModal from "@/components/community/CreatePostModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: number;
  likes: number;
  comments: number;
  tags: string[];
  isPinned?: boolean;
}

interface Comment {
  id: string;
  postId: string;
  content: string;
  author: string;
  timestamp: number;
}

const Community = () => {
  const [posts, setPosts] = useLocalStorage<Post[]>('communityPosts', []);
  const [comments, setComments] = useLocalStorage<Comment[]>('communityComments', []);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  const categories = [
    'All Posts',
    'University Matches',
    'Scholarships',
    'Application Tips',
    'Essays & Documents',
    'Financial Aid',
    'Study Abroad',
    'General Questions'
  ];

  const trendingTags = [
    'ivy-league',
    'scholarships',
    'essays',
    'sat-prep',
    'financial-aid',
    'transfers',
    'international',
    'stem-programs'
  ];

  const handleCreatePost = (postData: { title: string; content: string; files?: File[] }) => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: postData.title,
      content: postData.content,
      author: 'Anonymous User', // TODO: Use actual user when auth is implemented
      timestamp: Date.now(),
      likes: 0,
      comments: 0,
      tags: extractTags(postData.content)
    };

    setPosts(prev => [newPost, ...prev]);
    toast({
      title: "Post Created",
      description: "Your post has been shared with the community!",
    });
  };

  const extractTags = (content: string): string[] => {
    // Simple tag extraction based on keywords
    const keywords = ['scholarship', 'essay', 'application', 'university', 'college', 'financial aid'];
    return keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      postId,
      content: newComment,
      author: 'Anonymous User',
      timestamp: Date.now()
    };

    setComments(prev => [...prev, comment]);
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));

    setNewComment('');
    toast({
      title: "Comment Added",
      description: "Your comment has been posted!",
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const pinnedPosts = filteredPosts.filter(post => post.isPinned);
  const regularPosts = filteredPosts.filter(post => !post.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-muted-foreground">
            Connect with fellow students, share experiences, and get advice
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Categories & Filters */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category.toLowerCase() ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.toLowerCase())}
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Pinned Posts */}
            {pinnedPosts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Pin className="h-5 w-5" />
                  Pinned Posts
                </h2>
                <div className="space-y-4">
                  {pinnedPosts.map((post) => (
                    <Card key={post.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              by {post.author} • {new Date(post.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">Pinned</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="prose prose-sm max-w-none mb-4"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(post.content.slice(0, 200) + '...') 
                          }}
                        />
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1"
                          >
                            <Heart className="h-4 w-4" />
                            {post.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Separator className="my-6" />
              </div>
            )}

            {/* Regular Posts */}
            <div className="space-y-4">
              {regularPosts.map((post) => (
                <Card key={post.id} className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      by {post.author} • {new Date(post.timestamp).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none mb-4"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(
                          expandedPost === post.id ? post.content : post.content.slice(0, 200) + '...'
                        ) 
                      }}
                    />
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1"
                      >
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {expandedPost === post.id && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-3 mb-4">
                          {comments
                            .filter(comment => comment.postId === post.id)
                            .map((comment) => (
                              <div key={comment.id} className="bg-muted/30 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-sm font-medium">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                          />
                          <Button onClick={() => handleComment(post.id)}>
                            Post
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredPosts.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No posts found.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      Be the first to post!
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Button
                  className="w-full"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSearchQuery(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="text-sm font-medium">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Comments</span>
                  <span className="text-sm font-medium">{comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="text-sm font-medium">127</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default Community;