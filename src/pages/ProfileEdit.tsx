import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileEditor from "@/components/profile/ProfileEditor";

const ProfileEdit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-muted-foreground">
              Update your profile information and settings
            </p>
          </div>
        </div>

        {/* Profile Editor */}
        <ProfileEditor />
      </div>
    </div>
  );
};

export default ProfileEdit;