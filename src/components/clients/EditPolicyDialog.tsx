
import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useClients } from "@/hooks/useClients";
import type { Policy } from "@/types/policy";

interface EditPolicyDialogProps {
  policy: Policy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPolicyDialog({ policy, open, onOpenChange }: EditPolicyDialogProps) {
  const { updatePolicy } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Partial<Policy>>({
    defaultValues: {
      policy_name: policy.policy_name,
      policy_type: policy.policy_type,
      provider: policy.provider,
      policy_number: policy.policy_number,
      premium: policy.premium,
      value: policy.value,
      start_date: policy.start_date,
      end_date: policy.end_date,
      status: policy.status
    }
  });

  const onSubmit = async (data: Partial<Policy>) => {
    setIsSubmitting(true);
    try {
      await updatePolicy.mutateAsync({ id: policy.id, data });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="policy_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Policy Name" {...field} />
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
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

              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider/Insurer</FormLabel>
                    <FormControl>
                      <Input placeholder="Insurance provider" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="policy_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Policy number" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="premium"
                render={({ field: { onChange, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Premium ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Premium amount" 
                        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        {...restField}
                        value={restField.value === null ? "" : restField.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field: { onChange, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Value/Sum Assured ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Policy value" 
                        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        {...restField}
                        value={restField.value === null ? "" : restField.value} 
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
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
