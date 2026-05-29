import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, DollarSign, Search, Users, Star, Sparkles, Loader2 } from "lucide-react";
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
          searchQuery: "", fieldOfStudy: "", country: "",
          amountRange: [0, 50000], deadline: "", gpaRequirement: "", scholarshipType: ""
    });

    useEffect(() => {
          const loadAll = async () => {
                  setAllLoading(true);
                  try {
                            const { data, error } = await supabase.from('scholarships').select('*');
                            if (!error && data) setAllScholarships(data);
                  } catch (e) { console.error('Error loading scholarships:', e); }
                  finally { setAllLoading(false); }
          };
          loadAll();
    }, []);

    useEffect(() => {
          if (user) findMatches(user.id);
    }, [user]);

    const isScholarshipSaved = (id: string) => savedScholarships.some(s => s.scholarship_id === id);
    const handleSaveScholarship = async (id: string) => await saveScholarship(id);
    const handleUnsaveScholarship = async (id: string) => await unsaveScholarship(id);

    const filteredScholarships = allScholarships.filter((s) => {
          if (filters.searchQuery && !s.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
                      !s.provider.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
          if (filters.fieldOfStudy && s.eligible_majors && !s.eligible_majors.includes('All Majors') &&
                      !s.eligible_majors.includes(filters.fieldOfStudy)) return false;
          if (filters.scholarshipType && s.scholarship_type !== filters.scholarshipType) return false;
          return true;
    });

    const showPersonalized = user && matches.length > 0;

    return (
          <div className="min-h-screen bg-background">
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
                        <div className="container mx-auto px-4 py-8">
                                  <div className="flex items-center gap-4 mb-8">
                                              <Link to="/"><Button variant="outline" className="flex items-center gap-2"><ArrowLeft className="h-4 w-4" />Back to Home</Button>Button></Link>Link>
                                              <div>
                                                            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Scholarship Database</h1>h1>
                                                            <p className="text-muted-foreground">Discover funding opportunities matched to your profile</p>p>
                                              </div>div>
                                  </div>div>
                        
                                  <Card className="mb-8 bg-gradient-to-r from-secondary to-secondary/80 text-white">
                                              <CardContent className="p-8">
                                                            <div className="flex items-center gap-4 mb-6">
                                                                            <DollarSign className="h-12 w-12" />
                                                                            <div>
                                                                                              <h2 className="text-2xl font-bold mb-2">Find Your Perfect Scholarship Match</h2>h2>
                                                                                              <p className="text-white/90">Scholarships, grants, and financial aid curated for international students.</p>p>
                                                                            </div>div>
                                                            </div>div>
                                                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                                                            <div className="text-center"><div className="text-3xl font-bold text-accent">{allScholarships.length || '30'}+</div>div><div className="text-sm text-white/80">Scholarships Available</div>div></div>div>
                                                                            <div className="text-center"><div className="text-3xl font-bold text-accent">$2.5B</div>div><div className="text-sm text-white/80">Total Awards Available</div>div></div>div>
                                                                            <div className="text-center"><div className="text-3xl font-bold text-accent">85%</div>div><div className="text-sm text-white/80">Success Rate</div>div></div>div>
                                                            </div>div>
                                                            <div className="flex gap-4 flex-wrap">
                                                                            <Link to="/questionnaires/scholarships"><Button variant="ghost" size="lg" className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/30"><Sparkles className="h-4 w-4 mr-2" />Get Personalized Matches</Button>Button></Link>Link>
                                                              {user && <Link to="/features/saved-scholarships"><Button variant="outline" size="lg" className="mt-4 bg-white/10 hover:bg-white/20 text-white border border-white/30"><Star className="h-4 w-4 mr-2" />Saved ({savedScholarships.length})</Button>Button></Link>Link>}
                                                            </div>div>
                                              </CardContent>CardContent>
                                  </Card>Card>
                        
                                  <div className="grid lg:grid-cols-4 gap-6 mb-12">
                                              <div className="lg:col-span-1"><ScholarshipFilters onFiltersChange={setFilters} /></div>div>
                                              <div className="lg:col-span-3">
                                                {showPersonalized && (
                            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
                                              <CardContent className="p-6">
                                                                  <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" /><h3 className="text-lg font-semibold">Personalized For You</h3>h3></div>div>
                                                                  <p className="text-muted-foreground mb-4">{matches.length} scholarships matched to your profile</p>p>
                                                                  <Link to="/features/saved-scholarships"><Button variant="outline">View All My Matches</Button>Button></Link>Link>
                                              </CardContent>CardContent>
                            </Card>Card>
                                                            )}
                                                            <Tabs defaultValue={showPersonalized ? "matches" : "all"} className="space-y-6">
                                                                            <TabsList>
                                                                              {showPersonalized && <TabsTrigger value="matches">My Matches ({matches.length})</TabsTrigger>TabsTrigger>}
                                                                                                                                      <TabsTrigger value="all">All Scholarships</TabsTrigger>TabsTrigger></TabsTrigger>
                                                                            </TabsList>TabsList>
                                                              {showPersonalized && (
                              <TabsContent value="matches" className="space-y-4">
                                                  <div className="mb-4"><h2 className="text-2xl font-bold mb-1">Your Personalized Matches</h2>h2><p className="text-muted-foreground">Ranked by how well they match your profile</p>p></div>div>
                                {matchesLoading ? (
                                                      <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>div>
                                                    ) : (
                                                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        {matches.slice(0, 9).map((s: any) => <ScholarshipMatchCard key={s.id} scholarship={s} isSaved={isScholarshipSaved(s.id)} onSave={handleSaveScholarship} onUnsave={handleUnsaveScholarship} />)}
                                                      </div>div>
                                                  )}
                              </TabsContent>TabsContent>
                                                                            )}
                                                                            <TabsContent value="all" className="space-y-4">
                                                                                              <div className="flex items-center justify-between mb-4">
                                                                                                                  <div>
                                                                                                                                        <h2 className="text-2xl font-bold mb-1">All Scholarships</h2>h2>
                                                                                                                                        <p className="text-muted-foreground">{!user ? 'Sign in and complete your profile for personalized matches' : 'Browse all available scholarships'}</p>p>
                                                                                                                    </div>div>
                                                                                                {!showPersonalized && <Link to="/questionnaires/scholarships"><Button variant="outline" size="sm"><Sparkles className="h-4 w-4 mr-2" />Get Personalized Matches</Button>Button></Link>Link>}
                                                                                                </div>div>
                                                                              {allLoading ? (
                                <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-3 text-muted-foreground">Loading scholarships...</span>span></div>div>
                              ) : filteredScholarships.length === 0 ? (
                                <Card><CardContent className="p-8 text-center"><Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">No scholarships found</h3>h3><p className="text-muted-foreground">Try adjusting your filters</p>p></CardContent>CardContent></Card>Card>
                              ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {filteredScholarships.map((s: any) => <ScholarshipMatchCard key={s.id} scholarship={{...s, match_score: s.match_score || 75, match_reasons: s.match_reasons || ['Open to eligible students']}} isSaved={isScholarshipSaved(s.id)} onSave={handleSaveScholarship} onUnsave={handleUnsaveScholarship} />)}
                                </div>div>
                                                                                              )}
                                                                            </TabsContent>TabsContent>
                                                            </Tabs>Tabs>
                                              </div>div>
                                  </div>div>
                        
                                  <div className="mb-12">
                                              <h2 className="text-2xl font-bold mb-6 text-center">How Our AI Matching Works</h2>h2>
                                              <div className="grid md:grid-cols-3 gap-6">
                                                            <Card><CardHeader><Search className="h-8 w-8 text-primary mb-2" /><CardTitle>1. Profile Analysis</CardTitle>CardTitle></CardHeader>CardHeader><CardContent><p className="text-muted-foreground">Our AI analyzes your academic background, nationality, field of study, financial need, and achievements.</p>p></CardContent>CardContent></Card>Card>
                                                            <Card><CardHeader><DollarSign className="h-8 w-8 text-secondary mb-2" /><CardTitle>2. Smart Matching</CardTitle>CardTitle></CardHeader>CardHeader><CardContent><p className="text-muted-foreground">Advanced algorithms match your profile against scholarships, considering eligibility and award amounts.</p>p></CardContent>CardContent></Card>Card>
                                                            <Card><CardHeader><Users className="h-8 w-8 text-accent mb-2" /><CardTitle>3. Prioritized Results</CardTitle>CardTitle></CardHeader>CardHeader><CardContent><p className="text-muted-foreground">Receive ranked recommendations with deadlines, requirements, and direct links to apply.</p>p></CardContent>CardContent></Card>Card>
                                              </div>div>
                                  </div>div>
                        
                                  <Card className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
                                              <CardContent className="p-8">
                                                            <h3 className="text-xl font-bold mb-4">Start Finding Scholarships Today</h3>h3>
                                                            <p className="text-muted-foreground mb-6">Complete your profile to get personalized scholarship matches tailored to you.</p>p>
                                                            <Link to="/questionnaires/scholarships"><Button size="lg" className="mr-4">Find My Scholarships</Button>Button></Link>Link>
                                                            <Link to="/community?channel=scholarships"><Button variant="outline" size="lg">Read Success Stories</Button>Button></Link>Link>
                                              </CardContent>CardContent>
                                  </Card>Card>
                        </div>div>
                </div>div>
          </div>div>
        );
};

export default ScholarshipDatabase;</div>
