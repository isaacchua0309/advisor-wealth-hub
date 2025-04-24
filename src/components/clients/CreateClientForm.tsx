import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { CreateClientInput } from "@/types/client";
import { PolicyFormGroup } from "./PolicyFormGroup";
import type { CreatePolicyInput } from "@/types/policy";

interface CreateClientFormProps {
  onSubmit: (data: CreateClientInput, policies: CreatePolicyInput[]) => Promise<void>;
  isPending: boolean;
  onCancel?: () => void;
}

export function CreateClientForm({ onSubmit, isPending, onCancel }: CreateClientFormProps) {
  const [policies, setPolicies] = useState<CreatePolicyInput[]>([]);
  const { toast } = useToast();
  
  const form = useForm<CreateClientInput>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      occupation: "",
      age_group: "",
    },
  });

  const handleAddPolicy = () => {
    setPolicies([...policies, {
      policy_name: "",
      policy_type: "",
      provider: "",
      premium: null,
      start_date: null,
      end_date: null,
      status: "active",
      policy_number: "",
      value: null,
      payment_structure_type: 'regular_premium',
      commission_rate: null,
      first_year_commission: null,
      annual_ongoing_commission: null,
      policy_duration: null
    }]);
  };

  const handleRemovePolicy = (index: number) => {
    setPolicies(policies.filter((_, i) => i !== index));
  };

  const handlePolicyChange = (index: number, policy: CreatePolicyInput) => {
    const updatedPolicies = [...policies];
    updatedPolicies[index] = policy;
    setPolicies(updatedPolicies);
  };

  const handleFormSubmit = async (data: CreateClientInput) => {
    try {
      await onSubmit(data, policies);
      form.reset();
      setPolicies([]);
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    } catch (error) {
      console.error("Error creating client:", error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Occupation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Group</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an age group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46-55">46-55</SelectItem>
                    <SelectItem value="56+">56+</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Insurance Policies</h3>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddPolicy}
            >
              Add Policy
            </Button>
          </div>
          
          {policies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No policies added yet. Click 'Add Policy' to create one.</p>
          ) : (
            <div className="space-y-6">
              {policies.map((policy, index) => (
                <PolicyFormGroup 
                  key={index}
                  policy={policy}
                  onChange={(policy) => handlePolicyChange(index, policy)}
                  onRemove={() => handleRemovePolicy(index)}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
