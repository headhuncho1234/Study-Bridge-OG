import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";

interface FilterOptions {
  priceRange: number[];
  housingTypes: string[];
  amenities: string[];
  guarantorStatus: string;
  distance: string;
}

interface HousingFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  isInternationalStudent?: boolean;
}

const HousingFilters = ({ onFiltersChange, isInternationalStudent = false }: HousingFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [300, 3000],
    housingTypes: [],
    amenities: [],
    guarantorStatus: 'all',
    distance: 'all'
  });

  const housingTypes = [
    'On-Campus Dormitory',
    'Off-Campus Apartment', 
    'Homestay',
    'Shared House',
    'Studio Apartment'
  ];

  const amenities = [
    'WiFi included',
    'Furnished',
    'Utilities included',
    'Parking',
    'Gym access',
    'Laundry facilities',
    'Kitchen access',
    '24/7 Security'
  ];

  const guarantorOptions = isInternationalStudent ? [
    { value: 'all', label: 'All Options' },
    { value: 'no-guarantor', label: 'No Guarantor Required' },
    { value: 'guarantor-services', label: 'Third-party Guarantor Available' },
    { value: 'traditional', label: 'Traditional Guarantor Required' }
  ] : [];

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked 
      ? [...filters.amenities, amenity]
      : filters.amenities.filter(a => a !== amenity);
    handleFilterChange('amenities', newAmenities);
  };

  const handleHousingTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.housingTypes, type]
      : filters.housingTypes.filter(t => t !== type);
    handleFilterChange('housingTypes', newTypes);
  };

  const clearFilters = () => {
    const defaultFilters = {
      priceRange: [300, 3000],
      housingTypes: [],
      amenities: [],
      guarantorStatus: 'all',
      distance: 'all'
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = 
    (filters.housingTypes.length > 0 ? 1 : 0) +
    (filters.amenities.length > 0 ? 1 : 0) +
    (filters.guarantorStatus !== 'all' ? 1 : 0) +
    (filters.distance !== 'all' ? 1 : 0) +
    (filters.priceRange[0] !== 300 || filters.priceRange[1] !== 3000 ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Housing Options
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Monthly Budget: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              max={3000}
              min={300}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$300</span>
              <span>$3000+</span>
            </div>
          </div>

          {/* Housing Types */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Housing Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {housingTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={filters.housingTypes.includes(type)}
                    onCheckedChange={(checked) => handleHousingTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantor Status (International Students Only) */}
          {isInternationalStudent && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Guarantor Requirements</Label>
              <Select 
                value={filters.guarantorStatus} 
                onValueChange={(value) => handleFilterChange('guarantorStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guarantor preference" />
                </SelectTrigger>
                <SelectContent>
                  {guarantorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Distance */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Distance from Campus</Label>
            <Select 
              value={filters.distance} 
              onValueChange={(value) => handleFilterChange('distance', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Distance</SelectItem>
                <SelectItem value="walking">Walking Distance (0-0.5 miles)</SelectItem>
                <SelectItem value="short-commute">Short Commute (0.5-2 miles)</SelectItem>
                <SelectItem value="moderate-commute">Moderate Commute (2-5 miles)</SelectItem>
                <SelectItem value="long-commute">Long Commute (5+ miles)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amenities */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Important Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                  />
                  <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default HousingFilters;