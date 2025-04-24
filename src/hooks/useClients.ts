
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Client, CreateClientInput } from "@/types/client";

export function useClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });

  const createClient = useMutation({
    mutationFn: async (newClient: CreateClientInput) => {
      const { data, error } = await supabase
        .from("clients")
        .insert([newClient])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clients,
    isLoading,
    createClient,
  };
}
