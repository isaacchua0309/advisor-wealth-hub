
// Since this is a read-only file, we'll need to create a new component that extends its functionality
// We'll create a wrapper component that can work with global policies

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import type { Policy } from "@/types/policy";
import type { GlobalPolicy, CreateGlobalPolicyInput } from "@/types/globalPolicy";
import { Loader2 } from "lucide-react";

// This is a wrapper component that would normally modify EditPolicyDialog
// Since we can't modify it directly, we're creating this separate component
export function GlobalPolicySelector({
  policy,
  onPolicyChange
}: {
  policy: Policy;
  onPolicyChange: (updatedFields: Partial<Policy>) => void;
}) {
  const { globalPolicies, isLoadingPolicies } = useGlobalPolicies();
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(
    policy.global_policy_id || null
  );

  useEffect(() => {
    if (selectedPolicyId && globalPolicies) {
      const selectedPolicy = globalPolicies.find(p => p.id === selectedPolicyId);
      if (selectedPolicy) {
        // Update only the fields that should be populated from global policy
        onPolicyChange({
          global_policy_id: selectedPolicyId,
          policy_name: selectedPolicy.policy_name,
          policy_type: selectedPolicy.policy_type,
          payment_structure_type: selectedPolicy.payment_structure_type,
          premium: selectedPolicy.premium,
          commission_rate: selectedPolicy.commission_rate,
          policy_duration: selectedPolicy.policy_duration,
          start_date: selectedPolicy.start_date,
          end_date: selectedPolicy.end_date,
          value: selectedPolicy.value,
          provider: selectedPolicy.provider,
        });
      }
    } else if (!selectedPolicyId) {
      // If user selects "No Template", just update the global_policy_id
      onPolicyChange({
        global_policy_id: null
      });
    }
  }, [selectedPolicyId, globalPolicies, onPolicyChange]);

  return (
    <div className="mb-4">
      <FormLabel>Global Policy Template</FormLabel>
      <Select
        onValueChange={(value) => setSelectedPolicyId(value || null)}
        value={selectedPolicyId || ''}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a policy from your global policies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Custom Policy (No Template)</SelectItem>
          {globalPolicies?.map((policy) => (
            <SelectItem key={policy.id} value={policy.id}>
              {policy.policy_name} - {policy.policy_type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!globalPolicies?.length && !isLoadingPolicies && (
        <p className="text-xs text-muted-foreground mt-1">
          You haven't created any global policies yet. Visit the Global Policies page to create some.
        </p>
      )}
    </div>
  );
}
