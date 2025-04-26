
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
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { GlobalPolicy } from "@/types/globalPolicy";
import { Loader2 } from "lucide-react";

interface EditGlobalPolicyDialogProps {
  policy: GlobalPolicy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const policySchema = z.object({
  policy_name: z.string().min(1, "Policy name is required"),
  policy_type: z.string().min(1, "Policy type is required"),
  payment_structure_type: z.enum([
    'single_premium',
    'one_year_term',
    'regular_premium',
    'five_year_premium',
    'ten_year_premium',
    'lifetime_premium'
  ], { 
    required_error: "Payment structure is required",
  }),
  commission_rate: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().min(0, "Rate must be 0-100").max(100, "Rate must be 0-100").optional().nullable()
  ),
  first_year_commission_rate: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().min(0, "Rate must be 0-100").max(100, "Rate must be 0-100").optional().nullable()
  ),
  policy_duration: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().min(1, "Duration must be 1-30").max(30, "Duration must be 1-30").optional().nullable()
  ),
  provider: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

type PolicyFormValues = z.infer<typeof policySchema>;

export function EditGlobalPolicyDialog({
  policy,
  open,
  onOpenChange,
}: EditGlobalPolicyDialogProps) {
  const { updateGlobalPolicy } = useGlobalPolicies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      payment_structure_type: policy.payment_structure_type,
      commission_rate: policy.commission_rate,
      first_year_commission_rate: policy.first_year_commission_rate,
      policy_duration: policy.policy_duration,
      provider: policy.provider,
      status: policy.status || "active",
    },
  });
  
  // Reset form when policy changes
  useEffect(() => {
    form.reset({
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      payment_structure_type: policy.payment_structure_type,
      commission_rate: policy.commission_rate,
      first_year_commission_rate: policy.first_year_commission_rate,
      policy_duration: policy.policy_duration,
      provider: policy.provider,
      status: policy.status || "active",
    });
  }, [policy, form]);
  
  async function onSubmit(values: PolicyFormValues) {
    setIsSubmitting(true);
    try {
      await updateGlobalPolicy.mutateAsync({
        id: policy.id,
        data: values
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating global policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Global Policy</DialogTitle>
          <DialogDescription>
            Update this policy template for future client use.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="policy_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter policy name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="policy_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select policy type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider (Insurer)</FormLabel>
                    <FormControl>
                      <Input placeholder="Provider name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_structure_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Structure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment structure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single_premium">Single Premium</SelectItem>
                        <SelectItem value="one_year_term">One Year Term</SelectItem>
                        <SelectItem value="regular_premium">Regular Premium</SelectItem>
                        <SelectItem value="five_year_premium">Five Year Premium</SelectItem>
                        <SelectItem value="ten_year_premium">Ten Year Premium</SelectItem>
                        <SelectItem value="lifetime_premium">Lifetime Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="first_year_commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Year Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0-100" 
                        {...field} 
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ongoing Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0-100" 
                        {...field} 
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="policy_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Duration (Years)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Years" 
                        {...field} 
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'active'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
