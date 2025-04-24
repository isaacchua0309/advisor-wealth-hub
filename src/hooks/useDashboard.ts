
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboard() {
  // Get current year for calculations
  const currentYear = new Date().getFullYear();

  // Fetch total commission with proper calculation logic
  const { data: totalCommission, isLoading: isLoadingCommission } = useQuery({
    queryKey: ["totalCommission"],
    queryFn: async () => {
      // Get all active policies
      const { data: policies, error } = await supabase
        .from("policies")
        .select("first_year_commission, annual_ongoing_commission, start_date, status");
      
      if (error) throw error;
      
      let total = 0;
      
      policies.forEach(policy => {
        // Add first year commission for all active policies
        if (policy.status === "active" && policy.first_year_commission) {
          total += policy.first_year_commission;
        }
        
        // Add annual ongoing commission for policies from previous years
        if (policy.annual_ongoing_commission && policy.start_date) {
          const policyYear = new Date(policy.start_date).getFullYear();
          // Only include ongoing commission if the policy started at least a year ago
          if (policyYear < currentYear) {
            total += policy.annual_ongoing_commission;
          }
        }
      });
      
      return total;
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

  // Fetch annual commission data grouped by year
  const { data: annualCommission, isLoading: isLoadingAnnual } = useQuery({
    queryKey: ["annualCommission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("created_at, first_year_commission, annual_ongoing_commission, start_date");
      
      if (error) throw error;

      // Group by year and sum commissions
      const annualData = data.reduce((acc, policy) => {
        const year = new Date(policy.created_at).getFullYear();
        const firstYearAmount = policy.first_year_commission || 0;
        
        // For annual ongoing, check if policy start date is from previous years
        let ongoingAmount = 0;
        if (policy.start_date && policy.annual_ongoing_commission) {
          const startYear = new Date(policy.start_date).getFullYear();
          if (startYear < year) {
            ongoingAmount = policy.annual_ongoing_commission;
          }
        }
        
        const totalAmount = firstYearAmount + ongoingAmount;
        
        // Create entry for this year if it doesn't exist
        if (!acc[year]) {
          acc[year] = 0;
        }
        
        acc[year] += totalAmount;
        return acc;
      }, {});

      // Convert to array format for chart
      return Object.entries(annualData).map(([year, amount]) => ({
        year,
        amount,
      })).sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort by year ascending
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
    isLoadingAnnual || 
    isLoadingPipeline || 
    isLoadingUpcoming || 
    isLoadingRecentClients;

  return {
    totalCommission,
    activeClients,
    activePolicies,
    pendingTasks,
    annualCommission, // Changed from monthlyCommission to annualCommission
    pipelineData,
    upcomingTasks,
    recentClients,
    isLoading,
  };
}
