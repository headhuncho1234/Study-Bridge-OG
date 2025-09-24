import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileEditModal = ({ isOpen, onClose }: ProfileEditModalProps) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2 w-full">
              <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
              <Input
                id="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save Changes"}
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