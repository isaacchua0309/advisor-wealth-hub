
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, X, AlertCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import type { CreatePolicyInput } from "@/types/policy";
import { usePolicyForm, FormType } from "@/hooks/usePolicyForm";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { createPolicyFromGlobal } from "@/types/globalPolicy";

interface PolicyFormGroupProps {
  policy: CreatePolicyInput;
  onChange: (policy: CreatePolicyInput) => void;
  onRemove: () => void;
  index: number;
  clientId?: string; // Optional client ID for edit mode
}

export function PolicyFormGroup({ policy, onChange, onRemove, index, clientId }: PolicyFormGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { globalPolicies, isLoadingPolicies } = useGlobalPolicies();
  const form = useForm<FormType>({
    defaultValues: policy as unknown as FormType
  });

  const { getValidation, isFieldDisabled } = usePolicyForm(form);
  
  const globalPolicyId = form.watch('global_policy_id');

  // When a global policy is selected, populate the form with its values
  useEffect(() => {
    if (globalPolicyId && globalPolicies) {
      const selectedPolicy = globalPolicies.find(p => p.id === globalPolicyId);
      if (selectedPolicy) {
        // Use clientId if available (for edit mode) or use an empty string
        const newPolicy = createPolicyFromGlobal(selectedPolicy, clientId || '');
        
        // Update form values with the global policy values
        form.setValue('policy_name', selectedPolicy.policy_name);
        form.setValue('policy_type', selectedPolicy.policy_type);
        form.setValue('payment_structure_type', selectedPolicy.payment_structure_type);
        form.setValue('provider', selectedPolicy.provider);
        form.setValue('commission_rate', selectedPolicy.commission_rate);
        
        // Set first_year_commission_rate if it exists in the selected policy
        if ('first_year_commission_rate' in selectedPolicy) {
          form.setValue('first_year_commission_rate', selectedPolicy.first_year_commission_rate);
        }
        
        form.setValue('policy_duration', selectedPolicy.policy_duration);
        form.setValue('status', selectedPolicy.status);
        
        // Notify parent component
        onChange(newPolicy as CreatePolicyInput);
      }
    }
  }, [globalPolicyId, globalPolicies, form, clientId, onChange]);

  // Watch all form fields and update the parent component
  useEffect(() => {
    const subscription = form.watch((value) => {
      onChange(value as unknown as CreatePolicyInput);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4 border-b">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Policy {index + 1}
              {form.watch("policy_name") && `: ${form.watch("policy_name")}`}
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CollapsibleContent>
          <CardContent className="p-4 space-y-4">
            {/* Global Policy Selector */}
            <div className="mb-4">
              <Label htmlFor="global_policy_id">Global Policy</Label>
              <Select
                onValueChange={(value) => form.setValue('global_policy_id', value)}
                value={form.watch('global_policy_id') || ''}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Policy Name */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-name`}>
                  Policy Name
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="h-4 w-4 ml-1 inline-block text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The name of this insurance policy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id={`policy-${index}-name`}
                  {...form.register("policy_name", getValidation("policy_name"))}
                  disabled={isFieldDisabled("policy_name")}
                />
                {form.formState.errors.policy_name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.policy_name.message}
                  </p>
                )}
              </div>

              {/* Policy Type */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-type`}>Policy Type</Label>
                <Select
                  onValueChange={(value) => form.setValue("policy_type", value)}
                  value={form.watch("policy_type") || ""}
                  disabled={isFieldDisabled("policy_type")}
                >
                  <SelectTrigger id={`policy-${index}-type`}>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
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
                {form.formState.errors.policy_type && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.policy_type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-provider`}>Provider</Label>
                <Input
                  id={`policy-${index}-provider`}
                  {...form.register("provider")}
                  disabled={isFieldDisabled("provider")}
                />
              </div>

              {/* Payment Structure Type */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-structure`}>Payment Structure</Label>
                <Select
                  onValueChange={(value) => form.setValue("payment_structure_type", value as FormType['payment_structure_type'])}
                  value={form.watch("payment_structure_type")}
                  disabled={isFieldDisabled("payment_structure_type")}
                >
                  <SelectTrigger id={`policy-${index}-structure`}>
                    <SelectValue placeholder="Select payment structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_premium">Single Premium</SelectItem>
                    <SelectItem value="one_year_term">One Year Term</SelectItem>
                    <SelectItem value="regular_premium">Regular Premium</SelectItem>
                    <SelectItem value="five_year_premium">Five Year Premium</SelectItem>
                    <SelectItem value="ten_year_premium">Ten Year Premium</SelectItem>
                    <SelectItem value="lifetime_premium">Lifetime Premium</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.payment_structure_type && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.payment_structure_type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Premium */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-premium`}>Premium</Label>
                <Input
                  id={`policy-${index}-premium`}
                  type="number"
                  {...form.register("premium", {
                    valueAsNumber: true,
                    ...getValidation("premium"),
                  })}
                  disabled={isFieldDisabled("premium")}
                />
                {form.formState.errors.premium && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.premium.message}
                  </p>
                )}
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-value`}>Sum Assured</Label>
                <Input
                  id={`policy-${index}-value`}
                  type="number"
                  {...form.register("value", {
                    valueAsNumber: true,
                    ...getValidation("value"),
                  })}
                  disabled={isFieldDisabled("value")}
                />
                {form.formState.errors.value && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.value.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Commission Rate */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-commission`}>Commission Rate (%)</Label>
                <Input
                  id={`policy-${index}-commission`}
                  type="number"
                  {...form.register("commission_rate", {
                    valueAsNumber: true,
                    ...getValidation("commission_rate"),
                  })}
                  disabled={isFieldDisabled("commission_rate")}
                />
                {form.formState.errors.commission_rate && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.commission_rate.message}
                  </p>
                )}
              </div>

              {/* First Year Commission (Calculated) */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-first-year`}>First Year Commission</Label>
                <Input
                  id={`policy-${index}-first-year`}
                  type="number"
                  {...form.register("first_year_commission", { valueAsNumber: true })}
                  disabled
                />
              </div>

              {/* Annual Ongoing Commission (Calculated) */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-ongoing`}>Annual Ongoing</Label>
                <Input
                  id={`policy-${index}-ongoing`}
                  type="number"
                  {...form.register("annual_ongoing_commission", { valueAsNumber: true })}
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-start`}>Start Date</Label>
                <Input
                  id={`policy-${index}-start`}
                  type="date"
                  {...form.register("start_date", getValidation("start_date"))}
                />
                {form.formState.errors.start_date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.start_date.message}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-end`}>End Date</Label>
                <Input
                  id={`policy-${index}-end`}
                  type="date"
                  {...form.register("end_date", getValidation("end_date"))}
                />
                {form.formState.errors.end_date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.end_date.message}
                  </p>
                )}
              </div>

              {/* Policy Duration (Years) */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-duration`}>Duration (Years)</Label>
                <Input
                  id={`policy-${index}-duration`}
                  type="number"
                  {...form.register("policy_duration", {
                    valueAsNumber: true,
                    ...getValidation("policy_duration"),
                  })}
                  disabled={isFieldDisabled("policy_duration")}
                />
                {form.formState.errors.policy_duration && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.policy_duration.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Policy Number */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-number`}>Policy Number</Label>
                <Input
                  id={`policy-${index}-number`}
                  {...form.register("policy_number")}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor={`policy-${index}-status`}>Status</Label>
                <Select
                  onValueChange={(value) => form.setValue("status", value)}
                  value={form.watch("status") || "active"}
                >
                  <SelectTrigger id={`policy-${index}-status`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
