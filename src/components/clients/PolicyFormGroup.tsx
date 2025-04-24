
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CreatePolicyInput } from "@/types/policy";
import { Label } from "@/components/ui/label";

interface PolicyFormGroupProps {
  policy: CreatePolicyInput;
  onChange: (policy: CreatePolicyInput) => void;
  onRemove: () => void;
  index: number;
}

export function PolicyFormGroup({ policy, onChange, onRemove, index }: PolicyFormGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

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
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
