import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Search, Users, Star, Sparkles, Loader2, ExternalLink } from "lucide-react";
import ScholarshipFilters, { ScholarshipFilters as FilterType } from "@/components/scholarships/ScholarshipFilters";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useScholarshipMatching } from "@/hooks/useScholarshipMatching";
import ScholarshipMatchCard from "@/components/scholarships/ScholarshipMatchCard";
import { useSavedScholarships } from "@/hooks/useSavedScholarships";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const ScholarshipDatabase = () => {
  const { user } = useAuth();
  const { matches, findMatches, isLoading: matchesLoading } = useScholarshipMatching();
  const { savedScholarships, saveScholarship, unsaveScholarship } = useSavedScholarships(user?.id);
  const [allScholarships, setAllScholarships] = useState<any[]>([]);
  const [allLoading, setAllLoading] = useState(true);

  const [filters, setFilters] = useState<FilterType>({
    searchQuery: "",
    fieldOfStudy: "",
    country: "",
    amountRange: [0, 50000],
    deadline: "",
    gpaRequirement: "",
    scholarshipType: ""
  });

  useEffect(() => {
    const loadAll = async () => {
      setAllLoading(true);
      try {
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .order('deadline', { ascending: true });
        if (!error && data) setAllScholarships(data);
      } catch (e) {
        console.error('Error loading scholarships:', e);
      } finally {
        setAllLoading(false);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (user) findMatches(user.id);
  }, [user]);

  const isScholarshipSaved = (scholarshipId: string) =>
    savedScholarships.some(s => s.scholarship_id === scholarshipId);

  const handleSaveScholarship = async (id: string) => await saveScholarship(id);
  const handleUnsaveScholarship = async (id: string) => await unsaveScholarship(id);

  const filteredScholarships = allScholarships.filter((s) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      if (!s.title?.toLowerCase().includes(q) &&
          !s.provider?.toLowerCase().includes(q) &&
          !s.description?.toLowerCase().includes(q)) return false;
    }
    if (filters.fieldOfStudy && s.field_of_study &&
        s.field_of_study !== 'All Fields' &&
        !s.field_of_study.toLowerCase().includes(filters.fieldOfStudy.toLowerCase())) return false;
    if (filters.scholarshipType && s.category &&
        !s.category.toLowerCase().includes(filters.scholarshipType.toLowerCase())) return false;
    return true;
  });

  const showPersonalized = user && matches.length > 0;

  const difficultyBadge = (d: string) => {
    if (d === 'low') return <Badge className="bg-green-100 text-green-800 text-xs">Easy Apply</Badge>;
    if (d === 'medium') return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Moderate</Badge>;
    return <Badge className="bg-red-100 text-red-800 text-xs">Competitive</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">

          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Scholarship Database
              </h1>
              <p className="text-muted-foreground">
                {allLoading ? 'Loading scholarships...' : `${allScholarships.length} real 2026 scholarships`}
              </p>
            </div>
          </div>

          <Card className="mb-8 bg-gradient-to-r from-secondary to-secondary/80 text-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <DollarSign className="h-12 w-12" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Find Your Perfect Scholarship Match</h2>
                  <p className="text-white/90">
                    Real scholarships, grants, and fellowships curated for international and domestic students.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">{allLoading ? '...' : allScholarships.length}+</div>
                  <div className="text-sm text-white/80">Scholarships Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">$2.5B+</div>
                  <div className="text-sm text-white/80">Total Awards Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">2026</div>
                  <div className="text-sm text-white/80">Current Cycle</div>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link to="/questionnaires/scholarships">
                  <Button variant="ghost" size="lg" className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/30">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Personalized Matches
                  </Button>
                </Link>
                {user && (
                  <Link to="/features/saved-scholarships">
                    <Button variant="outline" size="lg" className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/30">
                      <Star className="h-4 w-4 mr-2" />
                      Saved ({savedScholarships.length})
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-4 gap-6 mb-12">
            <div className="lg:col-span-1">
              <ScholarshipFilters onFiltersChange={setFilters} />
            </div>

            <div className="lg:col-span-3">
              {showPersonalized && (
                <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Personalized For You</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {matches.length} scholarships matched to your profile
                    </p>
                    <Link to="/features/saved-scholarships">
                      <Button variant="outline">View All My Matches</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue={showPersonalized ? "matches" : "all"} className="space-y-6">
                <TabsList>
                  {showPersonalized && (
                    <TabsTrigger value="matches">My Matches ({matches.length})</TabsTrigger>
                  )}
                  <TabsTrigger value="all">
                    All Scholarships {!allLoading && `(${filteredScholarships.length})`}
                  </TabsTrigger>
                </TabsList>

                {showPersonalized && (
                  <TabsContent value="matches" className="space-y-4">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold mb-1">Your Personalized Matches</h2>
                      <p className="text-muted-foreground">Ranked by how well they match your profile</p>
                    </div>
                    {matchesLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.slice(0, 9).map((scholarship: any) => (
                          <ScholarshipMatchCard
                            key={scholarship.id}
                            scholarship={scholarship}
                            isSaved={isScholarshipSaved(scholarship.id)}
                            onSave={handleSaveScholarship}
                            onUnsave={handleUnsaveScholarship}
                          />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                )}

                <TabsContent value="all" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">All Scholarships</h2>
                      <p className="text-muted-foreground">
                        {!user ? 'Sign in and complete your profile to get personalized matches' : 'Browse all available scholarships'}
                      </p>
                    </div>
                    {!showPersonalized && (
                      <Link to="/questionnaires/scholarships">
                        <Button variant="outline" size="sm">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get Personalized Matches
                        </Button>
                      </Link>
                    )}
                  </div>

                  {allLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3 text-muted-foreground">Loading scholarships...</span>
                    </div>
                  ) : filteredScholarships.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No scholarships match your filters</h3>
                        <p className="text-muted-foreground">Try broadening your search criteria</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredScholarships.map((s: any) => (
                        <Card key={s.id} className="hover:shadow-lg transition-shadow flex flex-col">
                          <CardContent className="p-5 flex flex-col flex-1">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="font-semibold text-sm leading-tight">{s.title}</h3>
                              {isScholarshipSaved(s.id) ? (
                                <button onClick={() => handleUnsaveScholarship(s.id)}>
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                </button>
                              ) : (
                                <button onClick={() => handleSaveScholarship(s.id)}>
                                  <Star className="h-4 w-4 text-muted-foreground shrink-0" />
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">{s.provider}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg font-bold text-primary">{s.amount}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {s.category && (
                                <Badge variant="secondary" className="text-xs">{s.category}</Badge>
                              )}
                              {s.application_difficulty && difficultyBadge(s.application_difficulty)}
                              {s.financial_need_required && (
                                <Badge variant="outline" className="text-xs">Need-Based</Badge>
                              )}
                            </div>
                            <div className="mt-auto pt-3 border-t flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                {s.deadline && (
                                  <span>Due: {new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                )}
                              </div>
                              {s.application_link && (
                                <a href={s.application_link} target="_blank" rel="noopener noreferrer"
