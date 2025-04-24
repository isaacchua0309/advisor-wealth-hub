
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboard() {
  // Fetch total commission
  const { data: totalCommission, isLoading: isLoadingCommission } = useQuery({
    queryKey: ["totalCommission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("first_year_commission, annual_ongoing_commission");
      
      if (error) throw error;
      
      return data.reduce((total, policy) => {
        return total + (policy.first_year_commission || 0) + (policy.annual_ongoing_commission || 0);
      }, 0);
    },
  });

  // Fetch active clients count
  const { data: activeClients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["activeClients"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("clients")
        .select("*", { count: 'exact' });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch active policies count
  const { data: activePolicies, isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["activePolicies"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("policies")
        .select("*", { count: 'exact' })
        .eq("status", "active");
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch pending tasks count
  const { data: pendingTasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["pendingTasks"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tasks")
        .select("*", { count: 'exact' })
        .eq("status", "pending");
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch monthly commission data
  const { data: monthlyCommission, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ["monthlyCommission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("created_at, first_year_commission, annual_ongoing_commission");
      
      if (error) throw error;

      // Group by month and sum commissions
      const monthly = data.reduce((acc, policy) => {
        const month = new Date(policy.created_at).toLocaleString('default', { month: 'short' });
        const total = (policy.first_year_commission || 0) + (policy.annual_ongoing_commission || 0);
        
        acc[month] = (acc[month] || 0) + total;
        return acc;
      }, {});

      return Object.entries(monthly).map(([month, amount]) => ({
        month,
        amount,
      }));
    },
  });

  // Fetch deal pipeline data
  const { data: pipelineData, isLoading: isLoadingPipeline } = useQuery({
    queryKey: ["pipelineData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("pipeline_stage");
      
      if (error) throw error;

      const stages = {
        'Lead': 0,
        'Contacted': 0,
        'Proposal Sent': 0,
        'Negotiation': 0,
        'Closed Won': 0,
        'Closed Lost': 0,
      };

      data.forEach(client => {
        if (client.pipeline_stage in stages) {
          stages[client.pipeline_stage]++;
        }
      });

      return stages;
    },
  });

  // Fetch upcoming tasks
  const { data: upcomingTasks, isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ["upcomingTasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          clients (name)
        `)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent clients
  const { data: recentClients, isLoading: isLoadingRecentClients } = useQuery({
    queryKey: ["recentClients"],
    queryFn: async () => {
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, name")
        .order("created_at", { ascending: false })
        .limit(4);

      if (clientsError) throw clientsError;

      // For each client, fetch their policies
      const clientsWithPolicies = await Promise.all(
        clients.map(async (client) => {
          const { data: policies, error: policiesError } = await supabase
            .from("policies")
            .select("value")
            .eq("client_id", client.id);

          if (policiesError) throw policiesError;

          return {
            ...client,
            policies: policies.length,
            value: policies.reduce((sum, policy) => sum + (policy.value || 0), 0),
          };
        })
      );

      return clientsWithPolicies;
    },
  });

  const isLoading = 
    isLoadingCommission || 
    isLoadingClients || 
    isLoadingPolicies || 
    isLoadingTasks || 
    isLoadingMonthly || 
    isLoadingPipeline || 
    isLoadingUpcoming || 
    isLoadingRecentClients;

  return {
    totalCommission,
    activeClients,
    activePolicies,
    pendingTasks,
    monthlyCommission,
    pipelineData,
    upcomingTasks,
    recentClients,
    isLoading,
  };
}
