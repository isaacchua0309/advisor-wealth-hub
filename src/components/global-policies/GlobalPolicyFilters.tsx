
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { GlobalPolicyFilters } from "@/pages/GlobalPolicies";
import { search, x } from "lucide-react";

const POLICY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "auto", label: "Auto Insurance" },
  { value: "home", label: "Home Insurance" },
  { value: "disability", label: "Disability Insurance" },
  { value: "liability", label: "Liability Insurance" },
  { value: "business", label: "Business Insurance" },
  { value: "other", label: "Other" }
];

const PAYMENT_STRUCTURES = [
  { value: "all", label: "All Types" },
  { value: "single_premium", label: "Single Premium" },
  { value: "one_year_term", label: "One Year Term" },
  { value: "regular_premium", label: "Regular Premium" },
  { value: "five_year_premium", label: "Five Year Premium" },
  { value: "ten_year_premium", label: "Ten Year Premium" },
  { value: "lifetime_premium", label: "Lifetime Premium" }
];

interface GlobalPolicyFiltersProps {
  filters: GlobalPolicyFilters;
  setFilters: (filters: GlobalPolicyFilters) => void;
  clearFilters: () => void;
  maxPremium: number;
}

export function GlobalPolicyFilters({
  filters,
  setFilters,
  clearFilters,
  maxPremium
}: GlobalPolicyFiltersProps) {
  // For premium range display
  const [premiumDisplay, setPremiumDisplay] = useState(`$${filters.premiumRange[0]} - $${filters.premiumRange[1]}`);
  
  // For commission range display
  const [commissionDisplay, setCommissionDisplay] = useState(`${filters.commissionRange[0]}% - ${filters.commissionRange[1]}%`);
  
  // For duration range display
  const [durationDisplay, setDurationDisplay] = useState(`${filters.durationRange[0]} - ${filters.durationRange[1]} years`);
  
  // Helper function for updating filters
  const updateFilter = (key: keyof GlobalPolicyFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };
  
  return (
    <div>
      <h3 className="font-medium mb-4">Filter Policies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search Input */}
        <div>
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              placeholder="Search policy name..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>
        </div>
        
        {/* Policy Type Filter */}
        <div>
          <Label htmlFor="policy-type">Policy Type</Label>
          <Select
            value={filters.policyType}
            onValueChange={(value) => updateFilter("policyType", value)}
          >
            <SelectTrigger id="policy-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {POLICY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Payment Structure Filter */}
        <div>
          <Label htmlFor="payment-structure">Payment Structure</Label>
          <Select
            value={filters.paymentStructure}
            onValueChange={(value) => updateFilter("paymentStructure", value)}
          >
            <SelectTrigger id="payment-structure">
              <SelectValue placeholder="All Structures" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STRUCTURES.map((structure) => (
                <SelectItem key={structure.value} value={structure.value}>
                  {structure.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Clear Filters Button */}
        <div className="flex items-end">
          <Button 
            variant="outline" 
            onClick={clearFilters} 
            className="w-full"
          >
            <x className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Range Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Premium Range */}
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="premium-range">Premium Range</Label>
            <span className="text-sm text-muted-foreground">{premiumDisplay}</span>
          </div>
          <Slider
            id="premium-range"
            defaultValue={filters.premiumRange}
            max={maxPremium}
            step={1000}
            onValueChange={(value) => {
              updateFilter("premiumRange", value);
              setPremiumDisplay(`$${value[0]} - $${value[1]}`);
            }}
          />
        </div>
        
        {/* Commission Range */}
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="commission-range">Commission Range</Label>
            <span className="text-sm text-muted-foreground">{commissionDisplay}</span>
          </div>
          <Slider
            id="commission-range"
            defaultValue={filters.commissionRange}
            max={100}
            step={1}
            onValueChange={(value) => {
              updateFilter("commissionRange", value);
              setCommissionDisplay(`${value[0]}% - ${value[1]}%`);
            }}
          />
        </div>
        
        {/* Duration Range */}
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="duration-range">Duration Range</Label>
            <span className="text-sm text-muted-foreground">{durationDisplay}</span>
          </div>
          <Slider
            id="duration-range"
            defaultValue={filters.durationRange}
            max={30}
            step={1}
            onValueChange={(value) => {
              updateFilter("durationRange", value);
              setDurationDisplay(`${value[0]} - ${value[1]} years`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
