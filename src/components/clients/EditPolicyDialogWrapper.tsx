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
import { Policy } from "@/types/policy";
import { Loader2 } from "lucide-react";
import { GlobalPolicySelector } from "./GlobalPolicySelector";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { usePolicyForm, FormType } from "@/hooks/usePolicyForm";

interface EditPolicyDialogProps {
  policy: Policy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const policySchema = z.object({
  policy_name: z.string().min(1, "Policy name is required"),
  policy_type: z.string().min(1, "Policy type is required"),
  payment_structure_type: z.string().min(1, "Payment structure is required"),
  policy_number: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  premium: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().positive("Premium must be positive").optional().nullable()
  ),
  value: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().positive("Value must be positive").optional().nullable()
  ),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  commission_rate: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().min(0, "Rate must be 0-100").max(100, "Rate must be 0-100").optional().nullable()
  ),
  policy_duration: z.preprocess(
    (val) => (val === "" ? null : Number(val)), 
    z.number().min(1, "Duration must be 1-30").max(30, "Duration must be 1-30").optional().nullable()
  ),
  global_policy_id: z.string().optional().nullable(),
});

type PolicyFormValues = z.infer<typeof policySchema>;

export default function EditPolicyDialog({
  policy,
  open,
  onOpenChange,
}: EditPolicyDialogProps) {
  const { updatePolicy } = useClients();
  const { globalPolicies } = useGlobalPolicies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormType>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      payment_structure_type: policy.payment_structure_type,
      policy_number: policy.policy_number,
      provider: policy.provider,
      premium: policy.premium,
      value: policy.value,
      start_date: policy.start_date,
      end_date: policy.end_date,
      status: policy.status,
      commission_rate: policy.commission_rate,
      policy_duration: policy.policy_duration,
      first_year_commission: policy.first_year_commission,
      annual_ongoing_commission: policy.annual_ongoing_commission,
      global_policy_id: policy.global_policy_id,
    },
  });

  const { getValidation, isFieldDisabled } = usePolicyForm(form);
  
  // Reset form when policy changes
  useEffect(() => {
    form.reset({
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      payment_structure_type: policy.payment_structure_type,
      policy_number: policy.policy_number,
      provider: policy.provider,
      premium: policy.premium,
      value: policy.value,
      start_date: policy.start_date,
      end_date: policy.end_date,
      status: policy.status,
      commission_rate: policy.commission_rate,
      policy_duration: policy.policy_duration,
      first_year_commission: policy.first_year_commission,
      annual_ongoing_commission: policy.annual_ongoing_commission,
      global_policy_id: policy.global_policy_id,
    });
  }, [policy, form]);

  // Handle form submission
  async function onSubmit(values: FormType) {
    setIsSubmitting(true);
    
    try {
      await updatePolicy.mutateAsync({
        id: policy.id,
        data: {
          ...values,
          // Convert empty strings to null for nullable fields
          policy_number: values.policy_number || null,
          provider: values.provider || null,
          premium: values.premium || null,
          value: values.value || null,
          start_date: values.start_date || null,
          end_date: values.end_date || null,
          status: values.status || null,
          commission_rate: values.commission_rate || null,
          policy_duration: values.policy_duration || null,
          global_policy_id: values.global_policy_id || null,
        }
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handlePolicyChange = (updatedFields: Partial<Policy>) => {
    Object.entries(updatedFields).forEach(([key, value]) => {
      form.setValue(key as keyof FormType, value as any);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription>
            Update the policy details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <GlobalPolicySelector 
              policy={policy} 
              onPolicyChange={handlePolicyChange}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="policy_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter policy name" 
                        {...field} 
                        value={field.value || ""} 
                        disabled={isFieldDisabled("policy_name")}
                      />
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""} 
                      disabled={isFieldDisabled("policy_type")}
                    >
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
                name="policy_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter policy number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider (Insurer)</FormLabel>
                    <FormControl>
                      <Input placeholder="Provider name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_structure_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Structure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFieldDisabled("payment_structure_type")}>
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
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="premium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Premium Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        disabled={isFieldDisabled("premium")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sum Assured</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        disabled={isFieldDisabled("value")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0-100" 
                        {...field} 
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        disabled={isFieldDisabled("commission_rate")}
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
                        disabled={isFieldDisabled("policy_duration")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""}
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
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
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
                    Saving...
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
