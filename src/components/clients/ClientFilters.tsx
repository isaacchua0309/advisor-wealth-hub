
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
import type { Client } from "@/types/client";
import type { Policy } from "@/types/policy";

interface ClientFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: {
    ageGroup: string | null;
    pipelineStage: Client['pipeline_stage'] | null;
    minValue: number;
    maxValue: number;
  };
  onFilterChange: (filters: {
    ageGroup: string | null;
    pipelineStage: Client['pipeline_stage'] | null;
    minValue: number;
    maxValue: number;
  }) => void;
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
    const clientTotal = policies.reduce((sum, policy) => sum + (policy.value || 0), 0);
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
  
  useEffect(() => {
    // Update parent component when filters change
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  const resetFilters = () => {
    const resetFilters = {
      ageGroup: null,
      pipelineStage: null,
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
                    value={localFilters.ageGroup || ""} 
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      ageGroup: value || null
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any age group</SelectItem>
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
                    value={localFilters.pipelineStage || ""} 
                    onValueChange={(value) => setLocalFilters({
                      ...localFilters,
                      pipelineStage: value as Client['pipeline_stage'] || null
                    })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any stage</SelectItem>
                      {pipelineStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
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
