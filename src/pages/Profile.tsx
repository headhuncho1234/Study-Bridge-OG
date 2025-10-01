import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import UserProfile from "@/components/community/UserProfile";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <Link to="/community">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;