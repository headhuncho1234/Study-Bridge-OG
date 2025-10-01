import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <AlertCircle className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link to="/">
          <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
            <Home className="mr-2 h-4 w-4" />
            Return to Homepage
          </Button>
        </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
