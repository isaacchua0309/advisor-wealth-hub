
import { useState } from "react";
import { Client } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Pipeline stages in display order
const PIPELINE_STAGES = [
  "Lead",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

interface ClientPipelineFiltersProps {
  filters: {
    search: string;
    stages: Client["pipeline_stage"][];
    policyTypes: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    search: string;
    stages: Client["pipeline_stage"][];
    policyTypes: string[];
  }>>;
  allPolicyTypes: string[];
}

export function ClientPipelineFilters({
  filters,
  setFilters,
  allPolicyTypes,
}: ClientPipelineFiltersProps) {
  const resetFilters = () => {
    setFilters({
      search: "",
      stages: [...PIPELINE_STAGES],
      policyTypes: [],
    });
  };

  const toggleStage = (stage: Client["pipeline_stage"]) => {
    setFilters(prev => {
      if (prev.stages.includes(stage)) {
        return {
          ...prev,
          stages: prev.stages.filter(s => s !== stage)
        };
      } else {
        return {
          ...prev,
          stages: [...prev.stages, stage]
        };
      }
    });
  };

  const togglePolicyType = (type: string) => {
    setFilters(prev => {
      if (prev.policyTypes.includes(type)) {
        return {
          ...prev,
          policyTypes: prev.policyTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          policyTypes: [...prev.policyTypes, type]
        };
      }
    });
  };

  const selectAllStages = () => {
    setFilters(prev => ({
      ...prev,
      stages: [...PIPELINE_STAGES]
    }));
  };

  const clearAllStages = () => {
    setFilters(prev => ({
      ...prev,
      stages: []
    }));
  };

  const selectAllPolicyTypes = () => {
    setFilters(prev => ({
      ...prev,
      policyTypes: [...allPolicyTypes]
    }));
  };

  const clearAllPolicyTypes = () => {
    setFilters(prev => ({
      ...prev,
      policyTypes: []
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base">Pipeline Stages</Label>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={selectAllStages}>Select All</Button>
            <Button variant="outline" size="sm" onClick={clearAllStages}>Clear All</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="flex items-center space-x-2">
              <Checkbox 
                id={`stage-${stage}`}
                checked={filters.stages.includes(stage)}
                onCheckedChange={() => toggleStage(stage)}
              />
              <Label htmlFor={`stage-${stage}`} className="text-sm">
                {stage}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base">Policy Types</Label>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={selectAllPolicyTypes}>Select All</Button>
            <Button variant="outline" size="sm" onClick={clearAllPolicyTypes}>Clear All</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {allPolicyTypes.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox 
                id={`policy-type-${type}`}
                checked={filters.policyTypes.includes(type)}
                onCheckedChange={() => togglePolicyType(type)}
              />
              <Label htmlFor={`policy-type-${type}`} className="text-sm truncate">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={resetFilters}>
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}
