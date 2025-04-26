
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { GlobalPolicy, CreateGlobalPolicyInput } from "@/types/policy";
import { Loader2, AlertCircle } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);

  // Reset form data and error state when dialog opens/closes or mode changes
  useEffect(() => {
    setError(null);
    
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
    // Clear error when user makes changes
    setError(null);
  };

  const handleNumericChange = (field: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
    setError(null);
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.policy_name.trim()) {
      setError("Policy name is required");
      return false;
    }
    
    if (!formData.policy_type) {
      setError("Policy type is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
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
      setError(error instanceof Error ? error.message : "An error occurred while saving the policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "create" ? "Add Global Policy" : "Edit Global Policy"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === "create"
              ? "Create a new global policy template for your clients."
              : "Update an existing global policy template."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policy_name" className="font-medium">Policy Name</Label>
              <Input
                id="policy_name"
                value={formData.policy_name}
                onChange={(e) => handleChange("policy_name", e.target.value)}
                placeholder="AIA Health Plus"
                className="focus:ring-2 focus:ring-offset-1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider" className="font-medium">Provider</Label>
              <Input
                id="provider"
                value={formData.provider || ""}
                onChange={(e) => handleChange("provider", e.target.value)}
                placeholder="AIA"
                className="focus:ring-2 focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_type" className="font-medium">Policy Type</Label>
              <Select
                value={formData.policy_type}
                onValueChange={(value) => handleChange("policy_type", value)}
              >
                <SelectTrigger id="policy_type" className="focus:ring-2 focus:ring-offset-1">
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
              <Label htmlFor="first_year_commission_rate" className="font-medium">First Year Commission Rate (%)</Label>
              <Input
                id="first_year_commission_rate"
                type="number"
                value={formData.first_year_commission_rate === null ? "" : formData.first_year_commission_rate}
                onChange={(e) => handleNumericChange("first_year_commission_rate", e.target.value)}
                placeholder="55"
                min="0"
                max="100"
                className="focus:ring-2 focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ongoing_commission_rate" className="font-medium">Ongoing Commission Rate (%)</Label>
              <Input
                id="ongoing_commission_rate"
                type="number"
                value={formData.ongoing_commission_rate === null ? "" : formData.ongoing_commission_rate}
                onChange={(e) => handleNumericChange("ongoing_commission_rate", e.target.value)}
                placeholder="10"
                min="0"
                max="100"
                className="focus:ring-2 focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_duration" className="font-medium">Commission Duration (Years)</Label>
              <Input
                id="commission_duration"
                type="number"
                value={formData.commission_duration === null ? "" : formData.commission_duration}
                onChange={(e) => handleNumericChange("commission_duration", e.target.value)}
                placeholder="5"
                min="0"
                max="100"
                className="focus:ring-2 focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_duration" className="font-medium">Policy Duration (Years)</Label>
              <Input
                id="policy_duration"
                type="number"
                value={formData.policy_duration === null ? "" : formData.policy_duration}
                onChange={(e) => handleNumericChange("policy_duration", e.target.value)}
                placeholder="10"
                min="0"
                max="100"
                className="focus:ring-2 focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-medium">Status</Label>
              <Select
                value={formData.status || "Active"}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger id="status" className="focus:ring-2 focus:ring-offset-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_structure_type" className="font-medium">Payment Structure</Label>
              <Select
                value={formData.payment_structure_type}
                onValueChange={(value) => handleChange("payment_structure_type", value)}
              >
                <SelectTrigger id="payment_structure_type" className="focus:ring-2 focus:ring-offset-1">
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

          <DialogFooter className="mt-6 gap-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-gray-300 hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "create" ? "Create Policy" : "Update Policy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
