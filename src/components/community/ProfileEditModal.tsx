import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          cacheControl: '3600',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Image uploaded!",
        description: "Your avatar has been uploaded successfully."
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile({
        username: formData.username,
        display_name: formData.display_name || null,
        bio: formData.bio || null,
        avatar_url: formData.avatar_url || null
      });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated."
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback className="text-lg">
                  {(formData.display_name || formData.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 cursor-pointer"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 w-8 p-0"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </span>
                </Button>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            <div className="space-y-2 w-full">
              <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image file or enter a URL. Max size: 5MB
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Enter your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading || uploading} className="flex-1">
              {loading ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;