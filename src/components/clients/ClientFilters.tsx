
import { useState, useEffect } from "react";
import { ClientSearchBar } from "@/components/clients/ClientSearchBar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import {
  Slider
} from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import type { Client, ClientFilters } from "@/types/client";
import type { Policy } from "@/types/policy";

interface ClientFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: ClientFilters;
  onFilterChange: (filters: ClientFilters) => void;
  policyMap: Record<string, Policy[]>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function ClientFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  policyMap,
  isExpanded = false,
  onToggleExpand,
}: ClientFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [valueRange, setValueRange] = useState<[number, number]>([filters.minValue, filters.maxValue]);

  // Calculate max policy value across all clients for slider max
  const maxPolicyValue = Object.values(policyMap).reduce((max, policies) => {
    const clientTotal = policies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
    return Math.max(max, clientTotal);
  }, 10000); // Set a reasonable default if no policies exist
  
  // Age groups available in the system
  const ageGroups = ['Under 25', '25-34', '35-44', '45-54', '55-64', '65+'];
  
  // Pipeline stages from the enum
  const pipelineStages: Client['pipeline_stage'][] = [
    'Lead', 
    'Contacted', 
    'Proposal Sent', 
    'Negotiation', 
    'Closed Won', 
    'Closed Lost'
  ];

  // Policy types for filtering
  const policyTypes = ['life', 'health', 'investment', 'property', 'auto', 'business'];
  
  // Extract unique occupation types from clients for filtering
  const occupations = ['Financial Services', 'Healthcare', 'Technology', 'Education', 'Manufacturing', 'Retail', 'Other'];
  
  useEffect(() => {
    // Update parent component when filters change
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  const resetFilters = () => {
    const resetFilters = {
      ageGroup: null,
      pipelineStage: null,
      policyType: null,
      occupation: null,
      renewalPeriod: null,
      minValue: 0,
      maxValue: maxPolicyValue,
    };
    setLocalFilters(resetFilters);
    setValueRange([0, maxPolicyValue]);
  };
  
  const handleValueRangeChange = (newValues: number[]) => {
    setValueRange(newValues as [number, number]);
    setLocalFilters({
      ...localFilters,
      minValue: newValues[0],
      maxValue: newValues[1]
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <ClientSearchBar value={searchQuery} onChange={onSearchChange} />
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleExpand}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
          
          {(localFilters.ageGroup !== null || 
            localFilters.pipelineStage !== null || 
            localFilters.policyType !== null ||
            localFilters.occupation !== null ||
            localFilters.renewalPeriod !== null ||
            localFilters.minValue > 0 || 
            localFilters.maxValue < maxPolicyValue) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <Accordion type="single" collapsible className="border rounded-md p-4">
          <AccordionItem value="filters" className="border-none">
            <AccordionTrigger className="py-2">Advanced Filters</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age Group</label>
                  <Select 
                    value={localFilters.ageGroup || "any"} 
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      ageGroup: value === "any" ? null : value
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any age group</SelectItem>
                      {ageGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pipeline Stage</label>
                  <Select 
                    value={localFilters.pipelineStage || "any"}
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      pipelineStage: value === "any" ? null : value as Client['pipeline_stage']
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any stage</SelectItem>
                      {pipelineStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Policy Type</label>
                  <Select 
                    value={localFilters.policyType || "any"}
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      policyType: value === "any" ? null : value
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any policy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any policy type</SelectItem>
                      {policyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Occupation</label>
                  <Select 
                    value={localFilters.occupation || "any"}
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      occupation: value === "any" ? null : value
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any occupation</SelectItem>
                      {occupations.map((occupation) => (
                        <SelectItem key={occupation} value={occupation}>
                          {occupation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Renewal Period</label>
                  <Select 
                    value={localFilters.renewalPeriod || "any"}
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      renewalPeriod: value === "any" ? null : value
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any renewal period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any renewal period</SelectItem>
                      <SelectItem value="30">Next 30 days</SelectItem>
                      <SelectItem value="60">Next 60 days</SelectItem>
                      <SelectItem value="90">Next 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4 md:col-span-2 lg:col-span-1">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Policy Value Range</label>
                    <span className="text-xs text-muted-foreground">
                      ${valueRange[0].toLocaleString()} - ${valueRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    defaultValue={[localFilters.minValue, localFilters.maxValue]}
                    value={valueRange}
                    min={0}
                    max={maxPolicyValue}
                    step={1000}
                    onValueChange={handleValueRangeChange}
                    className="py-4"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
