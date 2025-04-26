import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import type { Client, CreateClientInput } from "@/types/client";
import type { Policy, CreatePolicyInput } from "@/types/policy";
import { useToast } from "@/hooks/use-toast";

export function useClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    let query = supabase.from("policies").select(`
      *,
      global_policies(*)
    `);
    
    if (clientId) {
      query = query.eq("client_id", clientId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) throw error;
    return data as (Policy & { global_policies: GlobalPolicy | null })[];
  };

  // Get all policies with their global policy data
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

  // Update client
  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Client> }) => {
      const { data: updatedClient, error } = await supabase
        .from("clients")
        .update(data)
        .eq("id", id)
        .select()
        .single();
        
      if (error) throw error;
      return updatedClient as Client;
    },
    onSuccess: (data, variables) => {
      // Update client in cache
      queryClient.setQueryData(["clients", variables.id], data);
      
      // Update client in clients list
      queryClient.setQueryData(["clients"], (oldData: Client[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(client => 
          client.id === variables.id ? { ...client, ...data } : client
        );
      });
      
      toast({
        title: "Client Updated",
        description: "Client information has been updated",
      });
    },
  });

  // Delete client
  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      // First delete any policies associated with this client
      const { error: policiesError } = await supabase
        .from("policies")
        .delete()
        .eq("client_id", id);
      
      if (policiesError) throw policiesError;
      
      // Then delete the client
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // Remove client from cache
      queryClient.removeQueries({ queryKey: ["clients", id] });
      
      // Update clients list
      queryClient.setQueryData(["clients"], (oldData: Client[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(client => client.id !== id);
      });
      
      // Invalidate policies query to refresh
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      
      toast({
        title: "Client Deleted",
        description: "Client has been permanently removed",
      });
    },
  });

  // Update client pipeline stage
  const updateClientPipelineStage = async (clientId: string, stage: Client['pipeline_stage']) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ pipeline_stage: stage })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;

      // Update the cache to reflect the changes
      queryClient.setQueryData(['clients', clientId], data);
      
      // Also update the client in the clients list cache
      queryClient.setQueryData(['clients'], (oldData: Client[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(client => 
          client.id === clientId ? { ...client, pipeline_stage: stage } : client
        );
      });

      // Show success toast
      toast({
        title: "Pipeline Stage Updated",
        description: `Client stage changed to ${stage}`
      });

      return data;
    } catch (error) {
      console.error("Error updating pipeline stage:", error);
      toast({
        title: "Error",
        description: "Failed to update pipeline stage",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Add new policy for a client
  const addPolicy = useMutation({
    mutationFn: async ({ 
      clientId, 
      policy 
    }: { 
      clientId: string, 
      policy: CreatePolicyInput 
    }) => {
      const { data, error } = await supabase
        .from("policies")
        .insert([{
          ...policy,
          client_id: clientId,
          user_id: user?.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Policy;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh policy data
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policies", data.client_id] });
      
      toast({
        title: "Policy Added",
        description: "New policy has been added successfully",
      });
    },
  });

  // Update policy
  const updatePolicy = useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string, 
      data: Partial<Policy> 
    }) => {
      const { data: updatedPolicy, error } = await supabase
        .from("policies")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedPolicy as Policy;
    },
    onSuccess: (data) => {
      // Update policies in cache
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policies", data.client_id] });
      
      toast({
        title: "Policy Updated",
        description: "Policy has been updated successfully",
      });
    },
  });

  // Delete policy
  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error, data } = await supabase
        .from("policies")
        .delete()
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Policy;
    },
    onSuccess: (data) => {
      // Update policies in cache
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["policies", data.client_id] });
      
      toast({
        title: "Policy Deleted",
        description: "Policy has been removed successfully",
      });
    },
  });

  return {
    clients,
    isLoadingClients,
    policies,
    isLoadingPolicies,
    createClient,
    updateClient,
    deleteClient,
    useClient,
    useClientPolicies,
    getPoliciesByClientId,
    updateClientPipelineStage,
    addPolicy,
    updatePolicy,
    deletePolicy,
  };
}
