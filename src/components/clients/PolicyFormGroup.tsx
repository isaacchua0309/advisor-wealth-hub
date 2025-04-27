
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
import { useForm, Controller } from "react-hook-form";
import type { CreatePolicyInput, GlobalPolicy } from "@/types/policy";
import { usePolicyForm } from "@/hooks/usePolicyForm";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";

interface PolicyFormGroupProps {
  policy: CreatePolicyInput;
  onChange: (policy: CreatePolicyInput) => void;
  onRemove: () => void;
  index: number;
}

export function PolicyFormGroup({ policy, onChange, onRemove, index }: PolicyFormGroupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const form = useForm<CreatePolicyInput>({
    defaultValues: policy,
    mode: 'onChange'
  });
  
  const { globalPolicies } = useGlobalPolicies();
  const { getValidation } = usePolicyForm(form as any);

  const handleChange = (field: string, value: any) => {
    onChange({
      ...policy,
      [field]: value
    });
    
    // Also update the form state for validation
    form.setValue(field as any, value, { 
      shouldValidate: true, 
      shouldDirty: true 
    });
  };

  const handleNumericChange = (field: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    handleChange(field, numValue);
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
          : null,
        payment_structure_type: selectedPolicy.payment_structure_type as any || 'regular_premium'
      };
      
      onChange(updatedPolicy);
      
      // Update form values for validation
      Object.entries(updatedPolicy).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value, { shouldValidate: true });
        }
      });
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

  // Initialize form with policy values
  useEffect(() => {
    Object.entries(policy).forEach(([key, value]) => {
      if (value !== undefined) {
        form.setValue(key as any, value, { shouldValidate: true });
      }
    });
  }, []);

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
            <Label htmlFor={`policy-name-${index}`}>Policy Name *</Label>
            <Controller
              name="policy_name"
              control={form.control}
              rules={getValidation('policy_name')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id={`policy-name-${index}`}
                    placeholder="Policy Name"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleChange("policy_name", e.target.value);
                    }}
                    className={error ? "border-red-500" : ""}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`policy-type-${index}`}>Policy Type *</Label>
            <Controller
              name="policy_type"
              control={form.control}
              rules={getValidation('policy_type')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Select
                    value={field.value || ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleChange("policy_type", value);
                    }}
                  >
                    <SelectTrigger id={`policy-type-${index}`} className={error ? "border-red-500" : ""}>
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
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`provider-${index}`}>Provider/Insurer *</Label>
            <Controller
              name="provider"
              control={form.control}
              rules={getValidation('provider')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id={`provider-${index}`}
                    placeholder="Insurance provider"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleChange("provider", e.target.value);
                    }}
                    className={error ? "border-red-500" : ""}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
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
            <Label htmlFor={`premium-${index}`}>Premium ($) *</Label>
            <Controller
              name="premium"
              control={form.control}
              rules={getValidation('premium')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id={`premium-${index}`}
                    type="number"
                    placeholder="Premium amount"
                    value={field.value === null || field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      field.onChange(value);
                      handleNumericChange("premium", e.target.value);
                    }}
                    className={error ? "border-red-500" : ""}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`value-${index}`}>Value/Sum Assured ($) *</Label>
            <Controller
              name="value"
              control={form.control}
              rules={getValidation('value')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id={`value-${index}`}
                    type="number"
                    placeholder="Policy value"
                    value={field.value === null || field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : parseFloat(e.target.value);
                      field.onChange(value);
                      handleNumericChange("value", e.target.value);
                    }}
                    className={error ? "border-red-500" : ""}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
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
            <Label htmlFor={`start-date-${index}`}>Start Date *</Label>
            <Controller
              name="start_date"
              control={form.control}
              rules={getValidation('start_date')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id={`start-date-${index}`}
                    type="date"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleChange("start_date", e.target.value);
                    }}
                    className={error ? "border-red-500" : ""}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`end-date-${index}`}>End Date *</Label>
            <Controller
              name="end_date"
              control={form.control}
              rules={getValidation('end_date')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input
                    id={`end-date-${index}`}
                    type="date"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      handleChange("end_date", e.target.value);
                    }}
                    className={error ? "border-red-500" : ""}
                    required
                  />
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
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
                  <Label htmlFor={`payment-structure-${index}`}>Payment Structure Type *</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select how the premium payments are structured over time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Controller
              name="payment_structure_type"
              control={form.control}
              rules={getValidation('payment_structure_type')}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleChange("payment_structure_type", value);
                    }}
                  >
                    <SelectTrigger id={`payment-structure-${index}`} className={error ? "border-red-500" : ""}>
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
                  {error && <p className="text-red-500 text-xs">{error.message}</p>}
                </>
              )}
            />
          </div>

          <div className="col-span-2 pt-2 border-t">
            <h5 className="font-medium mb-4">Commission Details</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`commission-rate-${index}`}>First Year Commission Rate (%) *</Label>
                <Controller
                  name="commission_rate"
                  control={form.control}
                  rules={getValidation('commission_rate')}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        id={`commission-rate-${index}`}
                        type="number"
                        placeholder="Commission rate"
                        value={field.value === null || field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                          handleNumericChange("commission_rate", e.target.value);
                        }}
                        className={error ? "border-red-500" : ""}
                        required
                      />
                      {error && <p className="text-red-500 text-xs">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ongoing-commission-rate-${index}`}>Ongoing Commission Rate (%)</Label>
                <Controller
                  name="ongoing_commission_rate"
                  control={form.control}
                  rules={getValidation('ongoing_commission_rate')}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        id={`ongoing-commission-rate-${index}`}
                        type="number"
                        placeholder="Ongoing commission rate"
                        value={field.value === null || field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseFloat(e.target.value);
                          field.onChange(value);
                          handleNumericChange("ongoing_commission_rate", e.target.value);
                        }}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && <p className="text-red-500 text-xs">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`commission-duration-${index}`}>Commission Duration (Years)</Label>
                <Controller
                  name="commission_duration"
                  control={form.control}
                  rules={getValidation('commission_duration')}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        id={`commission-duration-${index}`}
                        type="number" 
                        placeholder="Duration in years"
                        value={field.value === null || field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseInt(e.target.value);
                          field.onChange(value);
                          handleNumericChange("commission_duration", e.target.value);
                        }}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && <p className="text-red-500 text-xs">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`policy-duration-${index}`}>Policy Duration (Years)</Label>
                <Controller
                  name="policy_duration"
                  control={form.control}
                  rules={getValidation('policy_duration')}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        id={`policy-duration-${index}`}
                        type="number"
                        placeholder="Duration in years"
                        value={field.value === null || field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseInt(e.target.value);
                          field.onChange(value);
                          handleNumericChange("policy_duration", e.target.value);
                        }}
                        className={error ? "border-red-500" : ""}
                      />
                      {error && <p className="text-red-500 text-xs">{error.message}</p>}
                    </>
                  )}
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
