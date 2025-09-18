import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../ReactQuillStyles.css';
import { useToast } from "@/hooks/use-toast";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: { title: string; content: string; files?: File[] }) => void;
  prefillData?: { title: string; content: string };
}

const CreatePostModal = ({ isOpen, onClose, onSubmit, prefillData }: CreatePostModalProps) => {
  const [title, setTitle] = useState(prefillData?.title || '');
  const [content, setContent] = useState(prefillData?.content || '');
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for your post.",
        variant: "destructive"
      });
      return;
    }

    onSubmit({ title: title.trim(), content: content.trim(), files });
    
    // Reset form
    setTitle('');
    setContent('');
    setFiles([]);
    onClose();
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;