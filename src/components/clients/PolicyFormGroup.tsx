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
import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CreatePolicyInput } from "@/types/policy";
import { calculateOngoingCommission } from "@/types/policy";

interface PolicyFormGroupProps {
  policy: CreatePolicyInput;
  onChange: (policy: CreatePolicyInput) => void;
  onRemove: () => void;
  index: number;
}

export function PolicyFormGroup({ policy, onChange, onRemove, index }: PolicyFormGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (policy.premium && policy.commission_rate && policy.first_year_commission) {
      const totalCommission = policy.premium * (policy.commission_rate / 100);
      const ongoingCommission = calculateOngoingCommission(
        totalCommission,
        policy.first_year_commission,
        policy.payment_structure_type
      );
      
      if (policy.annual_ongoing_commission !== ongoingCommission) {
        handleChange('annual_ongoing_commission', ongoingCommission);
      }
    }
  }, [policy.premium, policy.commission_rate, policy.first_year_commission, policy.payment_structure_type]);

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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`start-date-${index}`}>Start Date</Label>
            <Input
              id={`start-date-${index}`}
              type="date"
              value={policy.start_date || ""}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`end-date-${index}`}>End Date</Label>
            <Input
              id={`end-date-${index}`}
              type="date"
              value={policy.end_date || ""}
              onChange={(e) => handleChange("end_date", e.target.value)}
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

          <div className="space-y-2">
            <Label htmlFor={`commission-rate-${index}`}>Commission Rate (%)</Label>
            <Input
              id={`commission-rate-${index}`}
              type="number"
              placeholder="Commission rate"
              value={policy.commission_rate === null ? "" : policy.commission_rate}
              onChange={(e) => handleNumericChange("commission_rate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`first-year-commission-${index}`}>First Year Commission ($)</Label>
            <Input
              id={`first-year-commission-${index}`}
              type="number"
              placeholder="First year commission"
              value={policy.first_year_commission === null ? "" : policy.first_year_commission}
              onChange={(e) => handleNumericChange("first_year_commission", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`annual-ongoing-commission-${index}`}>Annual Ongoing Commission ($)</Label>
            <Input
              id={`annual-ongoing-commission-${index}`}
              type="number"
              placeholder="Calculated automatically"
              value={policy.annual_ongoing_commission === null ? "" : policy.annual_ongoing_commission}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`policy-duration-${index}`}>Policy Duration (years)</Label>
            <Input
              id={`policy-duration-${index}`}
              type="number"
              placeholder="Policy duration"
              value={policy.policy_duration === null ? "" : policy.policy_duration}
              onChange={(e) => handleNumericChange("policy_duration", e.target.value)}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
