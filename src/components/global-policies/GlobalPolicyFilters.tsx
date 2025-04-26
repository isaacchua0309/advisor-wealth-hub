
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { GlobalPolicyFilters as GlobalPolicyFiltersType } from "@/pages/GlobalPolicies";

interface GlobalPolicyFiltersProps {
  filters: GlobalPolicyFiltersType;
  setFilters: (filters: GlobalPolicyFiltersType) => void;
  clearFilters: () => void;
  maxPremium: number;
}

export function GlobalPolicyFilters({
  filters,
  setFilters,
  clearFilters,
  maxPremium
}: GlobalPolicyFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };
  
  const handlePolicyTypeChange = (value: string) => {
    setFilters({
      ...filters,
      policyType: value
    });
  };
  
  const handlePaymentStructureChange = (value: string) => {
    setFilters({
      ...filters,
      paymentStructure: value
    });
  };
  
  const handleCommissionRangeChange = (values: number[]) => {
    setFilters({
      ...filters,
      commissionRange: [values[0], values[1]] as [number, number]
    });
  };
  
  const handleDurationRangeChange = (values: number[]) => {
    setFilters({
      ...filters,
      durationRange: [values[0], values[1]] as [number, number]
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-9"
            placeholder="Search by policy name..."
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={isExpanded ? "secondary" : "outline"} 
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-1"
          >
            Filters
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="gap-1"
          >
            Reset
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            <div>
              <Label>Policy Type</Label>
              <Select
                value={filters.policyType}
                onValueChange={handlePolicyTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="life">Life Insurance</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="auto">Auto Insurance</SelectItem>
                  <SelectItem value="home">Home Insurance</SelectItem>
                  <SelectItem value="disability">Disability Insurance</SelectItem>
                  <SelectItem value="liability">Liability Insurance</SelectItem>
                  <SelectItem value="business">Business Insurance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Payment Structure</Label>
              <Select
                value={filters.paymentStructure}
                onValueChange={handlePaymentStructureChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Structures" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Structures</SelectItem>
                  <SelectItem value="single_premium">Single Premium</SelectItem>
                  <SelectItem value="one_year_term">One Year Term</SelectItem>
                  <SelectItem value="regular_premium">Regular Premium</SelectItem>
                  <SelectItem value="five_year_premium">Five Year Premium</SelectItem>
                  <SelectItem value="ten_year_premium">Ten Year Premium</SelectItem>
                  <SelectItem value="lifetime_premium">Lifetime Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Commission Rate Range ({filters.commissionRange[0]}% - {filters.commissionRange[1]}%)</Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[filters.commissionRange[0], filters.commissionRange[1]]}
                onValueChange={handleCommissionRangeChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Duration Range ({filters.durationRange[0]} - {filters.durationRange[1]} years)</Label>
              <Slider
                min={0}
                max={30}
                step={1}
                value={[filters.durationRange[0], filters.durationRange[1]]}
                onValueChange={handleDurationRangeChange}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
