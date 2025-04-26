
import React from 'react';
import {
  FormControl,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { Policy } from "@/types/policy";
import { createPolicyFromGlobal } from "@/types/globalPolicy";
import { Button } from "@/components/ui/button";
import { Link2Off } from "lucide-react";

interface GlobalPolicySelectorProps {
  policy: Policy;
  onPolicyChange: (updatedFields: Partial<Policy>) => void;
}

export function GlobalPolicySelector({ policy, onPolicyChange }: GlobalPolicySelectorProps) {
  const { globalPolicies, isLoadingPolicies } = useGlobalPolicies();
  
  const handleGlobalPolicySelect = (globalPolicyId: string | null) => {
    if (!globalPolicyId) {
      return;
    }
    
    const selectedGlobalPolicy = globalPolicies?.find(gp => gp.id === globalPolicyId);
    
    if (selectedGlobalPolicy) {
      const updatedPolicy = createPolicyFromGlobal(selectedGlobalPolicy, policy.client_id);
      onPolicyChange({
        ...updatedPolicy,
        global_policy_id: selectedGlobalPolicy.id,
      });
    }
  };

  const handleUnlinkGlobalPolicy = () => {
    onPolicyChange({
      global_policy_id: null
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <FormItem className="flex-1">
          <FormLabel>Global Policy Template</FormLabel>
          <FormControl>
            <Select
              value={policy.global_policy_id || ""}
              onValueChange={handleGlobalPolicySelect}
              disabled={isLoadingPolicies}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a global policy template" />
              </SelectTrigger>
              <SelectContent>
                {globalPolicies?.map(globalPolicy => (
                  <SelectItem key={globalPolicy.id} value={globalPolicy.id}>
                    {globalPolicy.policy_name} - {globalPolicy.policy_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
        
        {policy.global_policy_id && (
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleUnlinkGlobalPolicy}
            title="Unlink from global policy"
          >
            <Link2Off className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {policy.global_policy_id && (
        <p className="text-xs text-muted-foreground">
          This policy is linked to a global policy template. Some fields will be automatically populated.
        </p>
      )}
    </div>
  );
}
