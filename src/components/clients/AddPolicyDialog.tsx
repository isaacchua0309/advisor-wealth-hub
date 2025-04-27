
import { useState, useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useClients } from "@/hooks/useClients";
import type { CreatePolicyInput } from "@/types/policy";
import { HelpCircle } from "lucide-react";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";

interface AddPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

export function AddPolicyDialog({ open, onOpenChange, clientId }: AddPolicyDialogProps) {
  const { addPolicy } = useClients();
  const { globalPolicies } = useGlobalPolicies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedOngoingCommission, setCalculatedOngoingCommission] = useState<number | null>(null);
  // New state to track selected global policy
  const [selectedGlobalPolicy, setSelectedGlobalPolicy] = useState<string>("none");

  const form = useForm<CreatePolicyInput>({
    defaultValues: {
      policy_name: "",
      policy_type: "",
      provider: "",
      policy_number: "",
      premium: undefined,
      value: undefined,
      start_date: undefined,
      end_date: undefined,
      status: "active",
      payment_structure_type: 'regular_premium',
      commission_rate: undefined,
      first_year_commission: undefined,
      annual_ongoing_commission: undefined,
      policy_duration: undefined,
      global_policy_id: undefined
    }
  });

  const watchPremium = form.watch('premium');
  const watchCommissionRate = form.watch('commission_rate');
  const watchFirstYearCommission = form.watch('first_year_commission');
  const watchPaymentStructure = form.watch('payment_structure_type');

  // Effect to handle global policy selection
  useEffect(() => {
    if (selectedGlobalPolicy && selectedGlobalPolicy !== "none" && globalPolicies) {
      const globalPolicy = globalPolicies.find(policy => policy.id === selectedGlobalPolicy);
      if (globalPolicy) {
        // Auto-fill fields from the selected global policy
        form.setValue('global_policy_id', globalPolicy.id);
        form.setValue('policy_name', globalPolicy.policy_name);
        form.setValue('policy_type', globalPolicy.policy_type);
        form.setValue('provider', globalPolicy.provider || undefined);
        form.setValue('payment_structure_type', globalPolicy.payment_structure_type as any || 'regular_premium');
        form.setValue('commission_rate', globalPolicy.first_year_commission_rate || undefined);
        form.setValue('ongoing_commission_rate', globalPolicy.ongoing_commission_rate || undefined);
        form.setValue('commission_duration', globalPolicy.commission_duration || undefined);
        form.setValue('policy_duration', globalPolicy.policy_duration || undefined);
      }
    }
  }, [selectedGlobalPolicy, globalPolicies, form]);

  // Calculate ongoing commission when values change
  useEffect(() => {
    if (watchPremium && watchCommissionRate && watchFirstYearCommission && watchPaymentStructure) {
      const totalCommission = watchPremium * (watchCommissionRate / 100);
      
      // Make sure first year commission doesn't exceed total commission
      if (watchFirstYearCommission > totalCommission) {
        form.setValue('first_year_commission', totalCommission);
      }
      
      // Calculate ongoing commission
      const remainingCommission = totalCommission - watchFirstYearCommission;
      let ongoingCommission = 0;
      
      switch(watchPaymentStructure) {
        case 'single_premium':
        case 'one_year_term':
          ongoingCommission = 0;
          break;
        case 'regular_premium':
          ongoingCommission = remainingCommission / 5;
          break;
        case 'five_year_premium':
          ongoingCommission = remainingCommission / 4;
          break;
        case 'ten_year_premium':
        case 'lifetime_premium':
          ongoingCommission = remainingCommission / 5;
          break;
        default:
          ongoingCommission = 0;
      }
      
      setCalculatedOngoingCommission(ongoingCommission);
      form.setValue('annual_ongoing_commission', ongoingCommission);
    }
  }, [watchPremium, watchCommissionRate, watchFirstYearCommission, watchPaymentStructure, form]);

  // Effect to calculate first year commission when premium and commission rate change
  useEffect(() => {
    if (watchPremium && watchCommissionRate) {
      const firstYearCommission = watchPremium * (watchCommissionRate / 100);
      form.setValue('first_year_commission', firstYearCommission);
    }
  }, [watchPremium, watchCommissionRate, form]);

  const onSubmit = async (data: CreatePolicyInput) => {
    setIsSubmitting(true);
    try {
      await addPolicy.mutateAsync({ clientId, policy: data });
      onOpenChange(false);
      form.reset();
      setSelectedGlobalPolicy("none");
    } catch (error) {
      console.error("Error adding policy:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle clearing the global policy selection
  const clearGlobalPolicy = () => {
    setSelectedGlobalPolicy("none");
    form.setValue('global_policy_id', undefined);
    // Reset fields that were auto-filled
    form.setValue('policy_name', "");
    form.setValue('policy_type', "");
    form.setValue('provider', "");
    form.setValue('payment_structure_type', 'regular_premium');
    form.setValue('commission_rate', undefined);
    form.setValue('ongoing_commission_rate', undefined);
    form.setValue('commission_duration', undefined);
    form.setValue('policy_duration', undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Policy</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-4">
              {/* New Global Policy Selector */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FormLabel>Select Global Policy</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Selecting a global policy will auto-fill common details and speed up data entry!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={selectedGlobalPolicy}
                  onValueChange={(value) => setSelectedGlobalPolicy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a global policy template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Create custom policy)</SelectItem>
                    {globalPolicies?.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.policy_name} ({policy.provider || "No Provider"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedGlobalPolicy !== "none" && (
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={clearGlobalPolicy}
                    >
                      Clear Global Policy
                    </Button>
                  </div>
                )}
                {selectedGlobalPolicy !== "none" && (
                  <FormDescription className="text-xs">
                    Fields auto-filled from global policy have a light gray background
                  </FormDescription>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="policy_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Policy Name" 
                          {...field} 
                          className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}
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
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}>
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
                        <Input 
                          placeholder="Insurance provider" 
                          {...field} 
                          value={field.value || ""} 
                          className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}
                        />
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
                          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value}
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
                          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value} 
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
                        value={field.value || "active"}
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

                {/* Payment structure and commission sections - these come from Global Policy when selected */}
                <FormField
                  control={form.control}
                  name="payment_structure_type"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Payment Structure</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>Select how premium payments are structured:</p>
                              <ul className="text-xs mt-1">
                                <li><strong>Single Premium:</strong> One-time payment</li>
                                <li><strong>One-Year Term:</strong> Annual renewable</li>
                                <li><strong>Regular Premium:</strong> Ongoing payments</li>
                                <li><strong>5-Year Premium:</strong> Payments for 5 years</li>
                                <li><strong>10-Year Premium:</strong> Payments for 10 years</li>
                                <li><strong>Lifetime Premium:</strong> Payments for life</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}>
                            <SelectValue placeholder="Select payment structure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single_premium">Single Premium</SelectItem>
                          <SelectItem value="one_year_term">One-Year Term Policy</SelectItem>
                          <SelectItem value="regular_premium">Regular Premium Policy</SelectItem>
                          <SelectItem value="five_year_premium">5-Year Premium Payment</SelectItem>
                          <SelectItem value="ten_year_premium">10-Year Premium Payment</SelectItem>
                          <SelectItem value="lifetime_premium">Lifetime Premium Payment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="policy_duration"
                  render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Policy Duration (years)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              The total duration of the policy in years
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Duration in years" 
                          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value}
                          className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commission_rate"
                  render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Commission Rate (%)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              The percentage of the premium that will be paid as commission
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Commission rate" 
                          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value}
                          className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="first_year_commission"
                  render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>First Year Commission ($)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              The commission amount paid in the first year
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="First year commission" 
                          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      {watchPremium && watchCommissionRate && (
                        <FormDescription className="text-xs">
                          Total commission: ${(watchPremium * (watchCommissionRate / 100)).toFixed(2)}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annual_ongoing_commission"
                  render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Annual Ongoing Commission ($)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Calculated based on payment structure:</p>
                              <ul className="text-xs mt-1">
                                <li>- Single Premium: No ongoing commission</li>
                                <li>- One-Year Term: No ongoing commission</li>
                                <li>- Regular Premium: Remaining / 5 years</li>
                                <li>- 5-Year: Remaining / 4 years</li>
                                <li>- 10-Year & Lifetime: Remaining / 5 years</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Auto-calculated" 
                          disabled
                          {...restField}
                          value={calculatedOngoingCommission !== null ? calculatedOngoingCommission.toFixed(2) : ""}
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Auto-calculated based on your payment structure
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Add fields for commission_duration and ongoing_commission_rate */}
                <FormField
                  control={form.control}
                  name="commission_duration"
                  render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Commission Duration (years)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              How long commissions will be paid for
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Commission duration" 
                          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value}
                          className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ongoing_commission_rate"
                  render={({ field: { onChange, ...restField } }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormLabel>Ongoing Commission Rate (%)</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Commission percentage for years after the first year
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ongoing rate" 
                          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          {...restField}
                          value={restField.value === undefined ? "" : restField.value}
                          className={selectedGlobalPolicy !== "none" ? "bg-muted" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
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
                {isSubmitting ? "Adding..." : "Add Policy"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
