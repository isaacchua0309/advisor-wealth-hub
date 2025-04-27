
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useClients } from "@/hooks/useClients";
import { useNavigate } from "react-router-dom";

import type { Policy } from "@/types/policy";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";

const formSchema = z.object({
  policy_name: z.string().min(2, {
    message: "Policy name must be at least 2 characters.",
  }),
  policy_type: z.string().min(1, {
    message: "Please select a policy type.",
  }),
  policy_number: z.string().optional(),
  provider: z.string().optional(),
  premium: z.number().optional().nullable(),
  value: z.number().optional().nullable(),
  sum_invested: z.number().optional().nullable(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
  payment_structure_type: z.enum([
    'single_premium',
    'one_year_term',
    'regular_premium',
    'five_year_premium',
    'ten_year_premium',
    'lifetime_premium'
  ]),
  commission_rate: z.number().optional().nullable(),
  ongoing_commission_rate: z.number().optional().nullable(),
  commission_duration: z.number().optional().nullable(),
  policy_duration: z.number().optional().nullable(),
  first_year_commission: z.number().optional().nullable(),
  annual_ongoing_commission: z.number().optional().nullable(),
  global_policy_id: z.string().optional().nullable(),
});

interface EditPolicyDialogProps {
  policy: Policy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPolicyDialog = ({ policy, open, onOpenChange }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updatePolicy, deletePolicy } = useClients();
  const clientId = policy.client_id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policy_name: policy.policy_name || "",
      policy_type: policy.policy_type || "",
      policy_number: policy.policy_number || "",
      provider: policy.provider || "",
      premium: policy.premium || null,
      value: policy.value || null,
      sum_invested: policy.sum_invested || null,
      start_date: policy.start_date || "",
      end_date: policy.end_date || "",
      status: policy.status || "",
      payment_structure_type: policy.payment_structure_type || "regular_premium",
      commission_rate: policy.commission_rate || null,
      ongoing_commission_rate: policy.ongoing_commission_rate || null,
      commission_duration: policy.commission_duration || null,
      policy_duration: policy.policy_duration || null,
      first_year_commission: policy.first_year_commission || null,
      annual_ongoing_commission: policy.annual_ongoing_commission || null,
      global_policy_id: policy.global_policy_id || null,
    },
  });

  const { globalPolicies } = useGlobalPolicies();

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updatePolicy.mutateAsync({ id: policy.id, data: values });
      toast({
        title: "Success",
        description: "Policy updated successfully.",
      });
      onOpenChange(false);
      navigate(`/clients/${clientId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update policy. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deletePolicy.mutateAsync(policy.id);
      toast({
        title: "Success",
        description: "Policy deleted successfully.",
      });
      onOpenChange(false);
      navigate(`/clients/${clientId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete policy. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle global policy selection
  const handleGlobalPolicyChange = (globalPolicyId: string) => {
    if (!globalPolicies) return;
    
    if (globalPolicyId) {
      const selectedPolicy = globalPolicies.find(p => p.id === globalPolicyId);
      if (selectedPolicy) {
        // Update form values with data from global policy
        setValue('global_policy_id', globalPolicyId);
        setValue('policy_name', selectedPolicy.policy_name);
        setValue('policy_type', selectedPolicy.policy_type);
        setValue('provider', selectedPolicy.provider);
        
        // Set commission rates from global policy
        setValue('commission_rate', selectedPolicy.first_year_commission_rate);
        setValue('ongoing_commission_rate', selectedPolicy.ongoing_commission_rate);
        
        // Set durations from global policy
        setValue('commission_duration', selectedPolicy.commission_duration);
        setValue('policy_duration', selectedPolicy.policy_duration);
        
        // Calculate commissions if premium is available
        const premium = watch('premium');
        if (premium && selectedPolicy.first_year_commission_rate) {
          setValue('first_year_commission', premium * selectedPolicy.first_year_commission_rate / 100);
        }
        
        if (premium && selectedPolicy.ongoing_commission_rate) {
          setValue('annual_ongoing_commission', premium * selectedPolicy.ongoing_commission_rate / 100);
        }
      }
    }
  };

  // Effect to calculate commissions when premium or rates change
  React.useEffect(() => {
    const premium = watch('premium');
    const commissionRate = watch('commission_rate');
    const ongoingRate = watch('ongoing_commission_rate');
    
    if (premium !== undefined && premium !== null) {
      if (commissionRate !== undefined && commissionRate !== null) {
        setValue('first_year_commission', premium * commissionRate / 100);
      }
      
      if (ongoingRate !== undefined && ongoingRate !== null) {
        setValue('annual_ongoing_commission', premium * ongoingRate / 100);
      }
    }
  }, [watch('premium'), watch('commission_rate'), watch('ongoing_commission_rate')]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription>
            Make changes to your client's policy here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4 px-6">
            {/* Global Policy Selection */}
            <div className="space-y-2">
              <Label htmlFor="global_policy_id">Global Policy Template</Label>
              <Controller
                name="global_policy_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : value);
                      handleGlobalPolicyChange(value === "none" ? "" : value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a global policy template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Custom Policy)</SelectItem>
                      {globalPolicies?.map((gp) => (
                        <SelectItem key={gp.id} value={gp.id}>
                          {gp.policy_name} ({gp.provider || "No Provider"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy_name">Policy Name</Label>
              <Controller
                name="policy_name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="policy_name"
                    placeholder="Policy Name"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {errors.policy_name && (
                <p className="text-sm text-red-500">{errors.policy_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy_type">Policy Type</Label>
              <Controller
                name="policy_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a type" />
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
                )}
              />
              {errors.policy_type && (
                <p className="text-sm text-red-500">{errors.policy_type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy_number">Policy Number</Label>
              <Controller
                name="policy_number"
                control={control}
                render={({ field }) => (
                  <Input
                    id="policy_number"
                    placeholder="Policy Number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Controller
                name="provider"
                control={control}
                render={({ field }) => (
                  <Input
                    id="provider"
                    placeholder="Provider"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="premium">Premium</Label>
              <Controller
                name="premium"
                control={control}
                render={({ field }) => (
                  <Input
                    id="premium"
                    type="number"
                    placeholder="Premium"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Controller
                name="value"
                control={control}
                render={({ field }) => (
                  <Input
                    id="value"
                    type="number"
                    placeholder="Value"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sum_invested">Sum Invested</Label>
              <Controller
                name="sum_invested"
                control={control}
                render={({ field }) => (
                  <Input
                    id="sum_invested"
                    type="number"
                    placeholder="Sum Invested"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <Input
                    id="start_date"
                    type="date"
                    placeholder="Start Date"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <Input
                    id="end_date"
                    type="date"
                    placeholder="End Date"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_structure_type">Payment Structure Type</Label>
              <Controller
                name="payment_structure_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment structure" />
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
                )}
              />
              {errors.payment_structure_type && (
                <p className="text-sm text-red-500">{errors.payment_structure_type.message}</p>
              )}
            </div>
            
            {/* Commission Details Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Commission Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">First Year Commission Rate (%)</Label>
                  <Controller
                    name="commission_rate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="commission_rate"
                        type="number"
                        placeholder="Commission rate"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_year_commission">First Year Commission ($)</Label>
                  <Controller
                    name="first_year_commission"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="first_year_commission"
                        type="number"
                        placeholder="First year commission"
                        readOnly
                        {...field}
                        value={field.value === null ? "" : field.value}
                        className="bg-muted"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ongoing_commission_rate">Ongoing Commission Rate (%)</Label>
                  <Controller
                    name="ongoing_commission_rate"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="ongoing_commission_rate"
                        type="number"
                        placeholder="Ongoing commission rate"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_ongoing_commission">Annual Ongoing Commission ($)</Label>
                  <Controller
                    name="annual_ongoing_commission"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="annual_ongoing_commission"
                        type="number"
                        placeholder="Annual ongoing commission"
                        readOnly
                        {...field}
                        value={field.value === null ? "" : field.value}
                        className="bg-muted"
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_duration">Commission Duration (Years)</Label>
                  <Controller
                    name="commission_duration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="commission_duration"
                        type="number"
                        placeholder="Commission duration"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy_duration">Policy Duration (Years)</Label>
                  <Controller
                    name="policy_duration"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="policy_duration"
                        type="number"
                        placeholder="Policy duration"
                        {...field}
                        value={field.value === null ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="mr-2"
            >
              Delete
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
