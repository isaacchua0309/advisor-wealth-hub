
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface GlobalPolicyFiltersProps {
  providers: string[];
  policyTypes: string[];
  filters: {
    provider: string;
    policyType: string;
    status: string;
    minCommissionRate: number;
    maxCommissionRate: number;
    minPolicyDuration: number;
    maxPolicyDuration: number;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    provider: string;
    policyType: string;
    status: string;
    minCommissionRate: number;
    maxCommissionRate: number;
    minPolicyDuration: number;
    maxPolicyDuration: number;
  }>>;
}

export function GlobalPolicyFilters({
  providers,
  policyTypes,
  filters,
  setFilters
}: GlobalPolicyFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const resetFilters = () => {
    setFilters({
      provider: "",
      policyType: "",
      status: "",
      minCommissionRate: 0,
      maxCommissionRate: 100,
      minPolicyDuration: 0,
      maxPolicyDuration: 50
    });
  };
  
  const hasActiveFilters = 
    filters.provider !== "" ||
    filters.policyType !== "" ||
    filters.status !== "" ||
    filters.minCommissionRate > 0 ||
    filters.maxCommissionRate < 100 ||
    filters.minPolicyDuration > 0 ||
    filters.maxPolicyDuration < 50;
    
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-1"
        >
          <Filter className="h-4 w-4 mr-1" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 px-1 py-0 h-5">
              {Object.values(filters).filter(value => 
                (typeof value === "string" && value !== "") || 
                (value !== 0 && value !== 100 && value !== 50)
              ).length}
            </Badge>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetFilters} 
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Reset Filters
          </Button>
        )}
      </div>
      
      {isFiltersOpen && (
        <Card className="mt-2">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Provider Filter */}
            <div className="space-y-2">
              <Label htmlFor="provider-filter">Provider</Label>
              <Select 
                value={filters.provider} 
                onValueChange={(value) => setFilters({...filters, provider: value})}
              >
                <SelectTrigger id="provider-filter">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Policy Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="policy-type-filter">Policy Type</Label>
              <Select 
                value={filters.policyType} 
                onValueChange={(value) => setFilters({...filters, policyType: value})}
              >
                <SelectTrigger id="policy-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {policyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Advanced Filters */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced-filters">
                <AccordionTrigger className="py-2">
                  Advanced Filters
                </AccordionTrigger>
                <AccordionContent>
                  {/* Commission Rate Filter */}
                  <div className="space-y-4 mt-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Commission Rate (%)</Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.minCommissionRate}% - {filters.maxCommissionRate}%
                        </span>
                      </div>
                      <Slider
                        defaultValue={[filters.minCommissionRate, filters.maxCommissionRate]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setFilters({
                          ...filters,
                          minCommissionRate: value[0],
                          maxCommissionRate: value[1]
                        })}
                        className="mb-4"
                      />
                    </div>
                    
                    {/* Policy Duration Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Policy Duration (Years)</Label>
                        <span className="text-sm text-muted-foreground">
                          {filters.minPolicyDuration} - {filters.maxPolicyDuration} years
                        </span>
                      </div>
                      <Slider
                        defaultValue={[filters.minPolicyDuration, filters.maxPolicyDuration]}
                        max={50}
                        step={1}
                        onValueChange={(value) => setFilters({
                          ...filters,
                          minPolicyDuration: value[0],
                          maxPolicyDuration: value[1]
                        })}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
