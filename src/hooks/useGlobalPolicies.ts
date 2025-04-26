
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { GlobalPolicy, CreateGlobalPolicyInput } from "@/types/policy";
import { useToast } from "@/hooks/use-toast";

export function useGlobalPolicies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all global policies
  const { data: globalPolicies, isLoading: isLoadingGlobalPolicies } = useQuery({
    queryKey: ["global_policies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_policies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Explicitly cast the data to GlobalPolicy[] to ensure type safety
      return data as unknown as GlobalPolicy[];
    },
    enabled: !!user,
  });

  // Check if policy name already exists (case-insensitive)
  const checkPolicyNameExists = async (policyName: string) => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from("global_policies")
      .select("id")
      .ilike("policy_name", policyName)
      .eq("user_id", user.id);
      
    if (error) {
      console.error("Error checking policy name:", error);
      return false;
    }
    
    return data && data.length > 0;
  };

  // Create global policy
  const createGlobalPolicy = useMutation({
    mutationFn: async (policy: CreateGlobalPolicyInput) => {
      // Check if policy name already exists (case-insensitive)
      const exists = await checkPolicyNameExists(policy.policy_name);
      
      if (exists) {
        throw new Error("This global policy name already exists. Please choose a different name.");
      }
      
      const { data, error } = await supabase
        .from("global_policies")
        .insert([{ ...policy, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data as unknown as GlobalPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_policies"] });
      toast({
        title: "Global Policy Created",
        description: "The global policy has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating Policy",
        description: error.message || "Failed to create global policy.",
        variant: "destructive",
      });
    }
  });

  // Update global policy
  const updateGlobalPolicy = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<GlobalPolicy> }) => {
      // If policy name is being updated, check for duplicates
      if (data.policy_name) {
        // Get the current policy to check if name is actually changing
        const { data: currentPolicy } = await supabase
          .from("global_policies")
          .select("policy_name")
          .eq("id", id)
          .single();
        
        // Only check for duplicates if the name is actually changing
        if (currentPolicy && currentPolicy.policy_name.toLowerCase() !== data.policy_name.toLowerCase()) {
          const exists = await checkPolicyNameExists(data.policy_name);
          if (exists) {
            throw new Error("This global policy name already exists. Please choose a different name.");
          }
        }
      }
      
      const { data: updatedPolicy, error } = await supabase
        .from("global_policies")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedPolicy as unknown as GlobalPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_policies"] });
      toast({
        title: "Global Policy Updated",
        description: "The global policy has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Policy",
        description: error.message || "Failed to update global policy.",
        variant: "destructive",
      });
    }
  });

  // Delete global policy
  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      // First, update any policies that reference this global policy
      const { error: updateError } = await supabase
        .from("policies")
        .update({ global_policy_id: null })
        .eq("global_policy_id", id);

      if (updateError) throw updateError;

      // Then delete the global policy
      const { error } = await supabase
        .from("global_policies")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_policies"] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast({
        title: "Global Policy Deleted",
        description: "The global policy has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Deleting Policy",
        description: error.message || "Failed to delete global policy.",
        variant: "destructive",
      });
    }
  });

  return {
    globalPolicies,
    isLoadingGlobalPolicies,
    createGlobalPolicy,
    updateGlobalPolicy,
    deleteGlobalPolicy: deletePolicy,
  };
}
