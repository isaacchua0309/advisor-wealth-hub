
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { GlobalPolicy } from "@/types/policy";
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
      return data as GlobalPolicy[];
    },
    enabled: !!user,
  });

  // Create global policy
  const createGlobalPolicy = useMutation({
    mutationFn: async (policy: Omit<GlobalPolicy, "id" | "created_at" | "updated_at" | "user_id">) => {
      const { data, error } = await supabase
        .from("global_policies")
        .insert([{ ...policy, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_policies"] });
      toast({
        title: "Global Policy Created",
        description: "The global policy has been created successfully.",
      });
    },
  });

  // Update global policy
  const updateGlobalPolicy = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<GlobalPolicy> }) => {
      const { data: updatedPolicy, error } = await supabase
        .from("global_policies")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_policies"] });
      toast({
        title: "Global Policy Updated",
        description: "The global policy has been updated successfully.",
      });
    },
  });

  // Delete global policy
  const deleteGlobalPolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("global_policies")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global_policies"] });
      toast({
        title: "Global Policy Deleted",
        description: "The global policy has been deleted successfully.",
      });
    },
  });

  return {
    globalPolicies,
    isLoadingGlobalPolicies,
    createGlobalPolicy,
    updateGlobalPolicy,
    deleteGlobalPolicy,
  };
}
