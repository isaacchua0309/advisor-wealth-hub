import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Client, CreateClientInput } from "@/types/client";
import type { Policy, CreatePolicyInput } from "@/types/policy";

export function useClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
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

  // Fetch a single client by ID
  const getClient = async (id: string) => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Client;
  };

  // Fetch client by ID with react-query
  const useClient = (id: string | undefined) => {
    return useQuery({
      queryKey: ["clients", id],
      queryFn: () => getClient(id!),
      enabled: !!id && !!user,
    });
  };

  // Fetch policies for all clients or a specific client
  const fetchPolicies = async (clientId?: string) => {
    let query = supabase.from("policies").select("*");
    
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as Policy[];
  };

  // Get all policies
  const { data: policies, isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["policies"],
    queryFn: () => fetchPolicies(),
    enabled: !!user,
  });

  // Get policies for a specific client
  const useClientPolicies = (clientId: string | undefined) => {
    return useQuery({
      queryKey: ["policies", clientId],
      queryFn: () => fetchPolicies(clientId),
      enabled: !!clientId && !!user,
    });
  };

  // Group policies by client ID
  const getPoliciesByClientId = () => {
    const policyMap: Record<string, Policy[]> = {};
    
    if (policies) {
      policies.forEach(policy => {
        if (!policyMap[policy.client_id]) {
          policyMap[policy.client_id] = [];
        }
        policyMap[policy.client_id].push(policy);
      });
    }
    
    return policyMap;
  };

  // Create a client with optional policies
  const createClient = useMutation({
    mutationFn: async ({ client, policies }: { 
      client: CreateClientInput, 
      policies: CreatePolicyInput[] 
    }) => {
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert([{ 
          ...client, 
          user_id: user?.id,
          pipeline_stage: client.pipeline_stage || 'Lead'
        }])
        .select()
        .single();

      if (clientError) throw clientError;
      
      // If there are policies to add, insert them with the new client ID
      if (policies.length > 0) {
        const policiesToInsert = policies.map(policy => ({
          ...policy,
          client_id: clientData.id,
          user_id: user?.id
        }));
        
        const { error: policiesError } = await supabase
          .from("policies")
          .insert(policiesToInsert);
          
        if (policiesError) throw policiesError;
      }
      
      return clientData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });

  return {
    clients,
    isLoadingClients,
    policies,
    isLoadingPolicies,
    createClient,
    useClient,
    useClientPolicies,
    getPoliciesByClientId,
  };
}
