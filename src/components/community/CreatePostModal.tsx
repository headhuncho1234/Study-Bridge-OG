import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../ReactQuillStyles.css';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { uploadMultipleImages } from "@/utils/imageUpload";

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
}

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
  channel: string;
  user_id: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: Omit<Post, 'id' | 'date' | 'likes' | 'comments'>) => void;
  prefillData?: Partial<Omit<Post, 'id' | 'date' | 'likes' | 'comments'>>;
  defaultChannel?: string;
  channels: Channel[];
}

const CreatePostModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  prefillData,
  defaultChannel = 'general',
  channels = [] 
}: CreatePostModalProps) => {
  // Add defensive check for channels array
  const safeChannels = Array.isArray(channels) ? channels : [];
  const [title, setTitle] = useState(prefillData?.title || '');
  const [content, setContent] = useState(prefillData?.content || '');
  const [channel, setChannel] = useState(prefillData?.channel || defaultChannel);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your post.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload images to Supabase Storage
      let imageUrls: string[] = [];
      if (files.length > 0) {
        imageUrls = await uploadMultipleImages(files, user.id);
      }

      onSubmit({
        title: title.trim(),
        content: content.trim(),
        author: 'User',
        authorAvatar: '',
        tags: [],
        images: imageUrls,
        channel,
        user_id: user.id
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setChannel(defaultChannel);
      setFiles([]);
      onClose();
      
      toast({
        title: "Success",
        description: "Your post has been created!",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['code-block']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'align', 'color', 'background', 'code-block'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {safeChannels.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    <div className="flex items-center gap-2">
                      {ch.icon}
                      {ch.name}
                    </div>
                  </SelectItem>
                ))}
                {safeChannels.length === 0 && (
                  <SelectItem value="general">General</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <div className="mt-1">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Write your post content..."
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="files">Attach Files (optional)</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1"
            />
            {files.length > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Selected: {files.map(f => f.name).join(', ')}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Submit Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;