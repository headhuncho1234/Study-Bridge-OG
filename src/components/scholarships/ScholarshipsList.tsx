import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, DollarSign, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: string;
  description: string;
  application_link: string | null;
  category: string;
  country: string | null;
  field_of_study: string | null;
}

const ScholarshipsList = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async () => {
    try {
      // First try to load from cache
      const cached = localStorage.getItem('scholarships_cache');
      const cacheTime = localStorage.getItem('scholarships_cache_time');
      
      if (cached && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime);
        // Cache valid for 24 hours
        if (cacheAge < 24 * 60 * 60 * 1000) {
          setScholarships(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .order('deadline', { ascending: true })
        .limit(6);

      if (error) throw error;

      if (data) {
        setScholarships(data);
        // Cache the results
        localStorage.setItem('scholarships_cache', JSON.stringify(data));
        localStorage.setItem('scholarships_cache_time', Date.now().toString());
      }
    } catch (error) {
      console.error('Error loading scholarships:', error);
      toast({
        title: "Error loading scholarships",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDeadline = (deadline: string) => {
    return new Date(deadline).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {scholarships.map((scholarship) => (
        <Card key={scholarship.id} className="hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-lg line-clamp-2">{scholarship.title}</CardTitle>
              <Badge variant="secondary">{scholarship.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-3 mb-4 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-semibold">{scholarship.amount}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Deadline: {formatDeadline(scholarship.deadline)}</span>
              </div>
              
              {scholarship.country && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-purple-500" />
                  <span>{scholarship.country}</span>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {scholarship.description}
              </p>
              
              <div className="pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Eligibility:</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{scholarship.eligibility}</p>
              </div>
            </div>
            
            {scholarship.application_link && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-auto"
                onClick={() => window.open(scholarship.application_link!, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ScholarshipsList;