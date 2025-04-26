import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useForm } from "react-hook-form";
import type { CreatePolicyInput, GlobalPolicy } from "@/types/policy";
import { usePolicyForm } from "@/hooks/usePolicyForm";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";

interface PolicyFormGroupProps {
  policy: CreatePolicyInput;
  onChange: (policy: CreatePolicyInput) => void;
  onRemove: () => void;
  index: number;
}

export function PolicyFormGroup({ policy, onChange, onRemove, index }: PolicyFormGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const form = useForm<CreatePolicyInput>({
    defaultValues: policy
  });
  
  const { globalPolicies } = useGlobalPolicies();
  const { getValidation } = usePolicyForm(form as any);

  const handleChange = (field: string, value: any) => {
    onChange({
      ...policy,
      [field]: value
    });
  };

  const handleNumericChange = (field: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onChange({
      ...policy,
      [field]: numValue
    });
  };

  const handleGlobalPolicyChange = (globalPolicyId: string) => {
    if (!globalPolicies) return;
    
    const selectedPolicy = globalPolicies.find(p => p.id === globalPolicyId);
    if (selectedPolicy) {
      const updatedPolicy = {
        ...policy,
        global_policy_id: globalPolicyId,
        policy_name: selectedPolicy.policy_name,
        policy_type: selectedPolicy.policy_type,
        provider: selectedPolicy.provider,
        commission_rate: selectedPolicy.first_year_commission_rate,
        ongoing_commission_rate: selectedPolicy.ongoing_commission_rate,
        commission_duration: selectedPolicy.commission_duration,
        policy_duration: selectedPolicy.policy_duration,
        first_year_commission: policy.premium && selectedPolicy.first_year_commission_rate 
          ? (policy.premium * selectedPolicy.first_year_commission_rate / 100) 
          : null,
        annual_ongoing_commission: policy.premium && selectedPolicy.ongoing_commission_rate 
          ? (policy.premium * selectedPolicy.ongoing_commission_rate / 100) 
          : null
      };
      
      onChange(updatedPolicy);
    }
  };

  useEffect(() => {
    if (policy.premium !== null && policy.premium !== undefined) {
      if (policy.commission_rate !== null && policy.commission_rate !== undefined) {
        const firstYearCommission = policy.premium * policy.commission_rate / 100;
        
        if (policy.first_year_commission !== firstYearCommission) {
          handleChange('first_year_commission', firstYearCommission);
        }
      }
      
      if (policy.ongoing_commission_rate !== null && policy.ongoing_commission_rate !== undefined) {
        const ongoingCommission = policy.premium * policy.ongoing_commission_rate / 100;
        
        if (policy.annual_ongoing_commission !== ongoingCommission) {
          handleChange('annual_ongoing_commission', ongoingCommission);
        }
      }
    }
  }, [policy.premium, policy.commission_rate, policy.ongoing_commission_rate]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 hover:underline">
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
          <h4 className="font-medium">
            {policy.policy_name || policy.policy_type || `Policy ${index + 1}`}
          </h4>
        </CollapsibleTrigger>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive">
          Remove
        </Button>
      </div>

      <CollapsibleContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`global-policy-${index}`}>Global Policy Template</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Selecting a global policy will pre-fill policy details based on the template.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={policy.global_policy_id || ""}
              onValueChange={handleGlobalPolicyChange}
            >
              <SelectTrigger id={`global-policy-${index}`}>
                <SelectValue placeholder="Select a global policy template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Custom Policy)</SelectItem>
                {globalPolicies?.map((gp) => (
                  <SelectItem key={gp.id} value={gp.id}>
                    {gp.policy_name} ({gp.provider || "No Provider"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`policy-name-${index}`}>Policy Name</Label>
            <Input
              id={`policy-name-${index}`}
              placeholder="Policy Name"
              value={policy.policy_name || ""}
              onChange={(e) => handleChange("policy_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`policy-type-${index}`}>Policy Type</Label>
            <Select
              value={policy.policy_type || ""}
              onValueChange={(value) => handleChange("policy_type", value)}
            >
              <SelectTrigger id={`policy-type-${index}`}>
                <SelectValue placeholder="Select type" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor={`provider-${index}`}>Provider/Insurer</Label>
            <Input
              id={`provider-${index}`}
              placeholder="Insurance provider"
              value={policy.provider || ""}
              onChange={(e) => handleChange("provider", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`policy-number-${index}`}>Policy Number</Label>
            <Input
              id={`policy-number-${index}`}
              placeholder="Policy number"
              value={policy.policy_number || ""}
              onChange={(e) => handleChange("policy_number", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`premium-${index}`}>Premium ($)</Label>
            <Input
              id={`premium-${index}`}
              type="number"
              placeholder="Premium amount"
              value={policy.premium === null ? "" : policy.premium}
              onChange={(e) => handleNumericChange("premium", e.target.value)}
              {...getValidation('premium')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`value-${index}`}>Value/Sum Assured ($)</Label>
            <Input
              id={`value-${index}`}
              type="number"
              placeholder="Policy value"
              value={policy.value === null ? "" : policy.value}
              onChange={(e) => handleNumericChange("value", e.target.value)}
              {...getValidation('value')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`sum-invested-${index}`}>Sum Invested ($)</Label>
            <Input
              id={`sum-invested-${index}`}
              type="number"
              placeholder="Amount invested"
              value={policy.sum_invested === null ? "" : policy.sum_invested}
              onChange={(e) => handleNumericChange("sum_invested", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`start-date-${index}`}>Start Date</Label>
            <Input
              id={`start-date-${index}`}
              type="date"
              value={policy.start_date || ""}
              onChange={(e) => handleChange("start_date", e.target.value)}
              {...getValidation('start_date')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`end-date-${index}`}>End Date</Label>
            <Input
              id={`end-date-${index}`}
              type="date"
              value={policy.end_date || ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
              {...getValidation('end_date')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`status-${index}`}>Status</Label>
            <Select
              value={policy.status || ""}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger id={`status-${index}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor={`payment-structure-${index}`}>Payment Structure Type</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select how the premium payments are structured over time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Select
              value={policy.payment_structure_type}
              onValueChange={(value) => handleChange("payment_structure_type", value)}
            >
              <SelectTrigger id={`payment-structure-${index}`}>
                <SelectValue placeholder="Select payment structure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single_premium">Single Premium</SelectItem>
                <SelectItem value="one_year_term">One-Year Term Policy</SelectItem>
                <SelectItem value="regular_premium">Regular Premium Policy</SelectItem>
                <SelectItem value="five_year_premium">5-Year Premium Payment</SelectItem>
                <SelectItem value="ten_year_premium">10-Year Premium Payment</SelectItem>
                <SelectItem value="lifetime_premium">Lifetime Premium Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 pt-2 border-t">
            <h5 className="font-medium mb-4">Commission Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`commission-rate-${index}`}>First Year Commission Rate (%)</Label>
                <Input
                  id={`commission-rate-${index}`}
                  type="number"
                  placeholder="Commission rate"
                  value={policy.commission_rate === null ? "" : policy.commission_rate}
                  onChange={(e) => handleNumericChange("commission_rate", e.target.value)}
                  {...getValidation('commission_rate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ongoing-commission-rate-${index}`}>Ongoing Commission Rate (%)</Label>
                <Input
                  id={`ongoing-commission-rate-${index}`}
                  type="number"
                  placeholder="Ongoing commission rate"
                  value={policy.ongoing_commission_rate === null ? "" : policy.ongoing_commission_rate}
                  onChange={(e) => handleNumericChange("ongoing_commission_rate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`commission-duration-${index}`}>Commission Duration (Years)</Label>
                <Input
                  id={`commission-duration-${index}`}
                  type="number" 
                  placeholder="Duration in years"
                  value={policy.commission_duration === null ? "" : policy.commission_duration}
                  onChange={(e) => handleNumericChange("commission_duration", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`policy-duration-${index}`}>Policy Duration (Years)</Label>
                <Input
                  id={`policy-duration-${index}`}
                  type="number"
                  placeholder="Duration in years"
                  value={policy.policy_duration === null ? "" : policy.policy_duration}
                  onChange={(e) => handleNumericChange("policy_duration", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`first-year-commission-${index}`}>First Year Commission ($)</Label>
                <Input
                  id={`first-year-commission-${index}`}
                  type="number"
                  placeholder="Auto-calculated"
                  value={policy.first_year_commission === null ? "" : policy.first_year_commission}
                  onChange={(e) => handleNumericChange("first_year_commission", e.target.value)}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`annual-ongoing-commission-${index}`}>Annual Ongoing Commission ($)</Label>
                <Input
                  id={`annual-ongoing-commission-${index}`}
                  type="number"
                  placeholder="Auto-calculated"
                  value={policy.annual_ongoing_commission === null ? "" : policy.annual_ongoing_commission}
                  onChange={(e) => handleNumericChange("annual_ongoing_commission", e.target.value)}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
