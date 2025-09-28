import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface ScholarshipFiltersProps {
  onFiltersChange?: (filters: ScholarshipFilters) => void;
}

export interface ScholarshipFilters {
  searchQuery: string;
  fieldOfStudy: string;
  country: string;
  amountRange: [number, number];
  deadline: string;
  gpaRequirement: string;
  scholarshipType: string;
}

const ScholarshipFilters = ({ onFiltersChange }: ScholarshipFiltersProps) => {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    searchQuery: "",
    fieldOfStudy: "",
    country: "",
    amountRange: [0, 50000],
    deadline: "",
    gpaRequirement: "",
    scholarshipType: ""
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (key: keyof ScholarshipFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);

    // Update active filters for visual display
    const newActiveFilters = Object.entries(newFilters)
      .filter(([filterKey, filterValue]) => {
        if (filterKey === 'searchQuery') return filterValue !== "";
        if (filterKey === 'amountRange') {
          const range = filterValue as [number, number];
          return range[0] > 0 || range[1] < 50000;
        }
        return filterValue !== "";
      })
      .map(([key]) => key);
    
    setActiveFilters(newActiveFilters);
  };

  const clearFilter = (filterKey: string) => {
    const clearedFilters = { ...filters };
    if (filterKey === 'amountRange') {
      clearedFilters.amountRange = [0, 50000];
    } else {
      (clearedFilters as any)[filterKey] = "";
    }
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: ScholarshipFilters = {
      searchQuery: "",
      fieldOfStudy: "",
      country: "",
      amountRange: [0, 50000],
      deadline: "",
      gpaRequirement: "",
      scholarshipType: ""
    };
    setFilters(clearedFilters);
    setActiveFilters([]);
    onFiltersChange?.(clearedFilters);
  };

  const getFilterDisplayName = (key: string) => {
    const displayNames: Record<string, string> = {
      searchQuery: "Search",
      fieldOfStudy: "Field of Study",
      country: "Country",
      amountRange: "Amount Range",
      deadline: "Deadline",
      gpaRequirement: "GPA Requirement",
      scholarshipType: "Type"
    };
    return displayNames[key] || key;
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scholarships..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {activeFilters.map((filterKey) => (
                <Badge key={filterKey} variant="secondary" className="flex items-center gap-1">
                  {getFilterDisplayName(filterKey)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => clearFilter(filterKey)}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Scholarships
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field of Study */}
          <div>
            <Label>Field of Study</Label>
            <Select value={filters.fieldOfStudy} onValueChange={(value) => handleFilterChange("fieldOfStudy", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="arts">Arts & Humanities</SelectItem>
                <SelectItem value="social-sciences">Social Sciences</SelectItem>
                <SelectItem value="natural-sciences">Natural Sciences</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country/Region */}
          <div>
            <Label>Country/Region</Label>
            <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Country</SelectItem>
                <SelectItem value="usa">United States</SelectItem>
                <SelectItem value="canada">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="australia">Australia</SelectItem>
                <SelectItem value="germany">Germany</SelectItem>
                <SelectItem value="france">France</SelectItem>
                <SelectItem value="netherlands">Netherlands</SelectItem>
                <SelectItem value="sweden">Sweden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Award Amount Range */}
          <div>
            <Label>Award Amount Range (USD)</Label>
            <div className="mt-2 mb-4">
              <Slider
                value={filters.amountRange}
                onValueChange={(value) => handleFilterChange("amountRange", value)}
                max={50000}
                min={0}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>${filters.amountRange[0].toLocaleString()}</span>
                <span>${filters.amountRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Application Deadline */}
          <div>
            <Label>Application Deadline</Label>
            <Select value={filters.deadline} onValueChange={(value) => handleFilterChange("deadline", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select deadline..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Within 1 month</SelectItem>
                <SelectItem value="3months">Within 3 months</SelectItem>
                <SelectItem value="6months">Within 6 months</SelectItem>
                <SelectItem value="1year">Within 1 year</SelectItem>
                <SelectItem value="ongoing">Ongoing applications</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GPA Requirement */}
          <div>
            <Label>Minimum GPA Requirement</Label>
            <Select value={filters.gpaRequirement} onValueChange={(value) => handleFilterChange("gpaRequirement", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select GPA..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any GPA</SelectItem>
                <SelectItem value="2.0">2.0+</SelectItem>
                <SelectItem value="2.5">2.5+</SelectItem>
                <SelectItem value="3.0">3.0+</SelectItem>
                <SelectItem value="3.5">3.5+</SelectItem>
                <SelectItem value="3.7">3.7+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scholarship Type */}
          <div>
            <Label>Scholarship Type</Label>
            <Select value={filters.scholarshipType} onValueChange={(value) => handleFilterChange("scholarshipType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="merit">Merit-Based</SelectItem>
                <SelectItem value="need">Need-Based</SelectItem>
                <SelectItem value="country">Country-Specific</SelectItem>
                <SelectItem value="field">Field-Specific</SelectItem>
                <SelectItem value="minority">Minority/Diversity</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScholarshipFilters;