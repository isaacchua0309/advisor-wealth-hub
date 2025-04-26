
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { GlobalPolicy, CreateGlobalPolicyInput } from "@/types/policy";
import { Loader2 } from "lucide-react"; // Add the missing import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GlobalPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  policy?: GlobalPolicy;
}

const defaultPolicy: CreateGlobalPolicyInput = {
  policy_name: "",
  policy_type: "",
  provider: null,
  first_year_commission_rate: null,
  ongoing_commission_rate: null,
  commission_duration: null,
  policy_duration: null,
  status: "Active",
  payment_structure_type: "regular_premium"
};

export default function GlobalPolicyDialog({
  open,
  onOpenChange,
  mode,
  policy,
}: GlobalPolicyDialogProps) {
  const { createGlobalPolicy, updateGlobalPolicy } = useGlobalPolicies();
  const [formData, setFormData] = useState<CreateGlobalPolicyInput>(defaultPolicy);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "edit" && policy) {
      // Set form data from existing policy for edit mode
      setFormData({
        policy_name: policy.policy_name,
        policy_type: policy.policy_type,
        provider: policy.provider,
        first_year_commission_rate: policy.first_year_commission_rate,
        ongoing_commission_rate: policy.ongoing_commission_rate,
        commission_duration: policy.commission_duration,
        policy_duration: policy.policy_duration,
        status: policy.status,
        payment_structure_type: policy.payment_structure_type as any || "regular_premium"
      });
    } else {
      // Reset form data for create mode
      setFormData(defaultPolicy);
    }
  }, [mode, policy, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumericChange = (field: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createGlobalPolicy.mutateAsync(formData);
      } else if (mode === "edit" && policy) {
        await updateGlobalPolicy.mutateAsync({
          id: policy.id,
          data: formData,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving global policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Global Policy" : "Edit Global Policy"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new global policy template for your clients."
              : "Update an existing global policy template."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy_name">Policy Name</Label>
              <Input
                id="policy_name"
                value={formData.policy_name}
                onChange={(e) => handleChange("policy_name", e.target.value)}
                placeholder="AIA Health Plus"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={formData.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
                placeholder="AIA"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_type">Policy Type</Label>
              <Select
                value={formData.policy_type}
                onValueChange={(value) => handleChange("policy_type", value)}
              >
                <SelectTrigger id="policy_type">
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
              <Label htmlFor="first_year_commission_rate">First Year Commission Rate (%)</Label>
              <Input
                id="first_year_commission_rate"
                type="number"
                value={formData.first_year_commission_rate === null ? "" : formData.first_year_commission_rate}
                onChange={(e) => handleNumericChange("first_year_commission_rate", e.target.value)}
                placeholder="55"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ongoing_commission_rate">Ongoing Commission Rate (%)</Label>
              <Input
                id="ongoing_commission_rate"
                type="number"
                value={formData.ongoing_commission_rate === null ? "" : formData.ongoing_commission_rate}
                onChange={(e) => handleNumericChange("ongoing_commission_rate", e.target.value)}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_duration">Commission Duration (Years)</Label>
              <Input
                id="commission_duration"
                type="number"
                value={formData.commission_duration === null ? "" : formData.commission_duration}
                onChange={(e) => handleNumericChange("commission_duration", e.target.value)}
                placeholder="5"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_duration">Policy Duration (Years)</Label>
              <Input
                id="policy_duration"
                type="number"
                value={formData.policy_duration === null ? "" : formData.policy_duration}
                onChange={(e) => handleNumericChange("policy_duration", e.target.value)}
                placeholder="10"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_structure_type">Payment Structure</Label>
              <Select
                value={formData.payment_structure_type}
                onValueChange={(value) => handleChange("payment_structure_type", value)}
              >
                <SelectTrigger id="payment_structure_type">
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
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? "Create Policy" : "Update Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
