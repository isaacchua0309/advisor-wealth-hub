import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // This would typically be a real API call to fetch dashboard data
      // For now, let's use mock data but structure as if from Supabase
      
      // Fetch total clients count
      const { count: totalClients, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      }

      // Fetch active clients (those with active policies)
      const { data: activeClientIds, error: activeError } = await supabase
        .from('policies')
        .select('client_id')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .is('client_id', 'not.null');
        
      if (activeError) {
        console.error('Error fetching active clients:', activeError);
      }

      // Get unique active client IDs
      const uniqueActiveClientIds = activeClientIds 
        ? [...new Set(activeClientIds.map(item => item.client_id))]
        : [];
      const activeClients = uniqueActiveClientIds.length;

      // Fetch active policies count
      const { count: activePolicies, error: policiesError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'active');
        
      if (policiesError) {
        console.error('Error fetching policies:', policiesError);
      }

      // Fetch pending tasks count
      const { count: pendingTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('status', 'pending');
        
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Calculate annual commission (month by month for current year)
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1).toISOString();
      const endOfYear = new Date(currentYear, 11, 31).toISOString();
      
      const { data: commissionData, error: commissionError } = await supabase
        .from('policies')
        .select('start_date, first_year_commission, annual_ongoing_commission')
        .eq('user_id', user?.id)
        .gte('start_date', startOfYear)
        .lte('start_date', endOfYear);
        
      if (commissionError) {
        console.error('Error fetching commission data:', commissionError);
      }

      const annualCommission = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1;
        const total = commissionData?.reduce((acc, policy) => {
          const policyDate = new Date(policy.start_date);
          if (policyDate.getMonth() + 1 === month) {
            return acc + (policy.first_year_commission || 0);
          }
          return acc + (policy.annual_ongoing_commission || 0) / 12;
        }, 0) || 0;
        
        return { 
          year: `${currentYear}-${month.toString().padStart(2, '0')}`,
          amount: total 
        };
      });

      // Fetch pipeline data
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('clients')
        .select('pipeline_stage')
        .eq('user_id', user?.id);
        
      if (pipelineError) {
        console.error('Error fetching pipeline data:', pipelineError);
      }

      // Count clients in each pipeline stage
      const pipeline = pipelineData?.reduce((acc, client) => {
        const stage = client.pipeline_stage;
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Ensure all stages are represented
      const allStages = ['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
      const formattedPipeline = allStages.reduce((acc, stage) => {
        acc[stage] = pipeline[stage] || 0;
        return acc;
      }, {} as Record<string, number>);

      // Fetch tasks with due dates
      const { data: upcomingTasks, error: upcomingError } = await supabase
        .from('tasks')
        .select('*, clients(name)')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true })
        .limit(5);
        
      if (upcomingError) {
        console.error('Error fetching upcoming tasks:', upcomingError);
      }

      // Fetch recent clients with their policy counts
      const { data: recentClientsRaw, error: recentError } = await supabase
        .from('clients')
        .select('id, name, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (recentError) {
        console.error('Error fetching recent clients:', recentError);
      }

      // Get policy counts and values for each client
      const recentClients = await Promise.all(
        (recentClientsRaw || []).map(async (client) => {
          const { data: policies, error: policyError } = await supabase
            .from('policies')
            .select('value')
            .eq('client_id', client.id);
            
          if (policyError) {
            console.error(`Error fetching policies for client ${client.id}:`, policyError);
          }
          
          const policyCount = policies?.length || 0;
          const totalValue = policies?.reduce((sum, policy) => sum + (policy.value || 0), 0) || 0;
          
          return {
            ...client,
            policies: policyCount,
            value: totalValue
          };
        })
      );

      // Calculate pending commissions (sum of first_year_commission for policies in 'pending' status)
      const { data: pendingCommissionsData, error: pendingCommError } = await supabase
        .from('policies')
        .select('first_year_commission')
        .eq('user_id', user?.id)
        .eq('status', 'pending');
        
      if (pendingCommError) {
        console.error('Error fetching pending commissions:', pendingCommError);
      }

      const pendingCommissions = pendingCommissionsData?.reduce(
        (sum, policy) => sum + (policy.first_year_commission || 0), 
        0
      ) || 0;

      // Calculate projected income for next 12 months
      const { data: projectedData, error: projectedError } = await supabase
        .from('policies')
        .select('first_year_commission, annual_ongoing_commission, start_date, status')
        .eq('user_id', user?.id)
        .in('status', ['active', 'pending']);
        
      if (projectedError) {
        console.error('Error fetching projected income data:', projectedError);
      }

      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      const projectedIncome = projectedData?.reduce((sum, policy) => {
        const startDate = policy.start_date ? new Date(policy.start_date) : null;
        if (!startDate) return sum;

        if (startDate > today && startDate < oneYearFromNow) {
          // New policy starting in the next 12 months
          return sum + (policy.first_year_commission || 0);
        } else {
          // Existing policy - count ongoing commission
          return sum + (policy.annual_ongoing_commission || 0);
        }
      }, 0) || 0;

      // Calculate year to date commission
      const startOfCurrentYear = new Date(today.getFullYear(), 0, 1);
      const { data: ytdData, error: ytdError } = await supabase
        .from('policies')
        .select('first_year_commission, start_date')
        .eq('user_id', user?.id)
        .gte('start_date', startOfCurrentYear.toISOString())
        .lte('start_date', today.toISOString());
        
      if (ytdError) {
        console.error('Error fetching YTD commission data:', ytdError);
      }

      const yearToDateCommission = ytdData?.reduce(
        (sum, policy) => sum + (policy.first_year_commission || 0), 
        0
      ) || 0;

      // Calculate upcoming renewals (policies ending in next 90 days)
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);

      const { count: upcomingRenewals, error: renewalsError } = await supabase
        .from('policies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .gte('end_date', today.toISOString())
        .lte('end_date', ninetyDaysFromNow.toISOString());
        
      if (renewalsError) {
        console.error('Error fetching upcoming renewals:', renewalsError);
      }

      // Get user's commission goal
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('commission_goal')
        .eq('id', user?.id)
        .single();
        
      if (profileError) {
        console.error('Error fetching commission goal:', profileError);
      }

      const commissionGoal = profileData?.commission_goal || 10000;

      return {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        activePolicies: activePolicies || 0,
        pendingTasks: pendingTasks || 0,
        annualCommission,
        pipelineData: formattedPipeline,
        upcomingTasks: upcomingTasks || [],
        recentClients: recentClients || [],
        pendingCommissions,
        projectedIncome,
        yearToDateCommission,
        upcomingRenewals: upcomingRenewals || 0,
        commissionGoal,
        isLoading: false
      };
    },
    enabled: !!user,
  });
}
