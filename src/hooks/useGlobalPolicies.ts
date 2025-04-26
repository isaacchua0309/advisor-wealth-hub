
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { GlobalPolicy, CreateGlobalPolicyInput } from "@/types/globalPolicy";

export function useGlobalPolicies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all global policies for the current user
  const { data: globalPolicies, isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["globalPolicies"],
    queryFn: async () => {
      if (!user) return [];
      
      // Using a raw query since the type definition doesn't include global_policies yet
      const { data, error } = await supabase
        .from("global_policies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GlobalPolicy[];
    },
    enabled: !!user,
  });

  // Fetch a single global policy by ID
  const getGlobalPolicy = async (id: string) => {
    if (!id) throw new Error("Policy ID is required");
    
    // Using a raw query since the type definition doesn't include global_policies yet
    const { data, error } = await supabase
      .from("global_policies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as GlobalPolicy;
  };

  // Fetch global policy by ID with react-query
  const useGlobalPolicy = (id: string | undefined) => {
    return useQuery({
      queryKey: ["globalPolicies", id],
      queryFn: () => getGlobalPolicy(id!),
      enabled: !!id && !!user,
    });
  };

  // Create a new global policy
  const createGlobalPolicy = useMutation({
    mutationFn: async (policyData: CreateGlobalPolicyInput) => {
      if (!user) throw new Error("User not authenticated");
      
      // Using a raw query since the type definition doesn't include global_policies yet
      const { data, error } = await supabase
        .from("global_policies")
        .insert([{
          ...policyData,
          user_id: user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as GlobalPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalPolicies"] });
      toast({
        title: "Global Policy Created",
        description: "Your policy has been added to your global policy list",
      });
    },
  });

  // Update an existing global policy
  const updateGlobalPolicy = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<GlobalPolicy> }) => {
      // Using a raw query since the type definition doesn't include global_policies yet
      const { data: updatedPolicy, error } = await supabase
        .from("global_policies")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedPolicy as GlobalPolicy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["globalPolicies"] });
      queryClient.invalidateQueries({ queryKey: ["globalPolicies", data.id] });
      
      toast({
        title: "Global Policy Updated",
        description: "Your policy has been updated successfully",
      });
    },
  });

  // Delete a global policy
  const deleteGlobalPolicy = useMutation({
    mutationFn: async (id: string) => {
      // Using a raw query since the type definition doesn't include global_policies yet
      const { error } = await supabase
        .from("global_policies")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["globalPolicies"] });
      queryClient.removeQueries({ queryKey: ["globalPolicies", id] });
      
      toast({
        title: "Global Policy Deleted",
        description: "Your policy has been removed from your global policy list",
      });
    },
  });

  return {
    globalPolicies,
    isLoadingPolicies,
    getGlobalPolicy,
    useGlobalPolicy,
    createGlobalPolicy,
    updateGlobalPolicy,
    deleteGlobalPolicy
  };
}
