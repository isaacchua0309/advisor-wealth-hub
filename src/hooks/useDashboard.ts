import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboard() {
  // Get current date for calculations
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  // Fetch total commission with proper calculation logic
  const { data: totalCommission, isLoading: isLoadingCommission } = useQuery({
    queryKey: ["totalCommission"],
    queryFn: async () => {
      // Get all policies
      const { data: policies, error } = await supabase
        .from("policies")
        .select("first_year_commission, annual_ongoing_commission, start_date, status, policy_duration");
      
      if (error) throw error;
      
      let total = 0;
      
      policies.forEach(policy => {
        // Skip policies that aren't active
        if (policy.status !== "active" || !policy.start_date) {
          return;
        }
        
        const startDate = new Date(policy.start_date);
        const policyYears = calculateYearsSince(startDate, currentDate);
        
        // Add first year commission for completed first year
        if (policyYears >= 1 && policy.first_year_commission) {
          total += policy.first_year_commission;
        }
        
        // Add annual ongoing commission for years past the first year
        if (policy.annual_ongoing_commission && policyYears > 1) {
          // Calculate how many years of ongoing commission we should count
          // This should be the minimum of:
          // 1. Maximum 5 years (regulatory limit)
          // 2. Policy duration minus 1 (first year uses first_year_commission)
          // 3. Actual years that have passed minus 1 (first year)
          
          const maxOngoingYears = 5; // Maximum allowed by regulation
          const policyRemainingYears = policy.policy_duration ? policy.policy_duration - 1 : Infinity;
          const actualOngoingYears = policyYears - 1; // Exclude the first year
          
          // Take the minimum of these three constraints
          const ongoingYearsToCount = Math.min(
            maxOngoingYears, 
            policyRemainingYears, 
            actualOngoingYears
          );
          
          total += policy.annual_ongoing_commission * ongoingYearsToCount;
        }
      });
      
      return total;
    },
  });

  // Helper function to calculate years between two dates
  function calculateYearsSince(startDate, currentDate) {
    const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
    
    // If we haven't reached the anniversary date yet this year, subtract 1
    if (
      currentDate.getMonth() < startDate.getMonth() || 
      (currentDate.getMonth() === startDate.getMonth() && 
       currentDate.getDate() < startDate.getDate())
    ) {
      return Math.max(0, yearDiff - 1);
    }
    
    return yearDiff;
  }

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

  // Fetch annual commission data grouped by year with corrected calculation
  const { data: annualCommission, isLoading: isLoadingAnnual } = useQuery({
    queryKey: ["annualCommission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("start_date, first_year_commission, annual_ongoing_commission, policy_duration, status");
      
      if (error) throw error;

      // Group by year and sum commissions with corrected logic
      const annualData = {};
      
      data.forEach(policy => {
        // Skip policies that aren't active or don't have a start date
        if (policy.status !== "active" || !policy.start_date) {
          return;
        }
        
        const startDate = new Date(policy.start_date);
        const startYear = startDate.getFullYear();
        
        // Process first year commission
        if (policy.first_year_commission && startYear < currentYear) {
          // Only count if the first year has been completed
          if (!annualData[startYear]) {
            annualData[startYear] = 0;
          }
          annualData[startYear] += policy.first_year_commission;
        }
        
        // Process annual ongoing commission for completed years
        if (policy.annual_ongoing_commission) {
          const maxOngoingYears = 5; // Maximum allowed by regulation
          const policyRemainingYears = policy.policy_duration ? policy.policy_duration - 1 : Infinity;
          
          // Calculate how many years of ongoing commission we should count
          for (let yearOffset = 1; yearOffset <= Math.min(maxOngoingYears, policyRemainingYears); yearOffset++) {
            const yearToCheck = startYear + yearOffset;
            
            // Only count completed years
            if (yearToCheck < currentYear) {
              if (!annualData[yearToCheck]) {
                annualData[yearToCheck] = 0;
              }
              annualData[yearToCheck] += policy.annual_ongoing_commission;
            }
          }
        }
      });

      // Convert to array format for chart
      return Object.entries(annualData).map(([year, amount]) => ({
        year,
        amount,
      })).sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Sort by year ascending
    },
  });

  // NEW: Fetch pending commissions (upcoming FYC / Renewals)
  const { data: pendingCommissions, isLoading: isLoadingPendingCommissions } = useQuery({
    queryKey: ["pendingCommissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("start_date, first_year_commission, annual_ongoing_commission, policy_duration, status");
      
      if (error) throw error;
      
      let pendingAmount = 0;
      
      data.forEach(policy => {
        // Only consider active policies
        if (policy.status !== "active" || !policy.start_date) {
          return;
        }
        
        const startDate = new Date(policy.start_date);
        const policyYears = calculateYearsSince(startDate, currentDate);
        const yearFraction = calculateYearFraction(startDate, currentDate);
        
        // First year commission that's pending (for policies in their first year)
        if (policyYears === 0 && policy.first_year_commission) {
          pendingAmount += policy.first_year_commission;
        }
        
        // Ongoing commission that will be paid this year but hasn't been paid yet
        // Check if we're in a renewal year but haven't hit the renewal date yet
        if (policy.annual_ongoing_commission && policyYears >= 1) {
          const renewalMonth = startDate.getMonth();
          const renewalDay = startDate.getDate();
          
          // If current date is before the renewal date this year, count it as pending
          if (
            (currentMonth < renewalMonth) || 
            (currentMonth === renewalMonth && currentDay < renewalDay)
          ) {
            // Check if we haven't exceeded the policy duration or the max years
            const maxOngoingYears = 5;
            const policyRemainingYears = policy.policy_duration ? policy.policy_duration - 1 : Infinity;
            
            if (policyYears <= Math.min(maxOngoingYears, policyRemainingYears)) {
              pendingAmount += policy.annual_ongoing_commission;
            }
          }
        }
      });
      
      return pendingAmount;
    },
  });

  // Helper function to calculate partial year fraction
  function calculateYearFraction(startDate, currentDate) {
    const totalDays = 365;
    const startTime = startDate.getTime();
    const currentTime = currentDate.getTime();
    const diffDays = Math.floor((currentTime - startTime) / (1000 * 60 * 60 * 24));
    return (diffDays % totalDays) / totalDays;
  }

  // NEW: Fetch projected income for next 12 months
  const { data: projectedIncome, isLoading: isLoadingProjectedIncome } = useQuery({
    queryKey: ["projectedIncome"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("start_date, first_year_commission, annual_ongoing_commission, policy_duration, status");
      
      if (error) throw error;
      
      let projectedTotal = 0;
      const projectionDate = new Date();
      projectionDate.setFullYear(projectionDate.getFullYear() + 1); // 12 months from now
      
      data.forEach(policy => {
        // Only consider active policies
        if (policy.status !== "active" || !policy.start_date) {
          return;
        }
        
        const startDate = new Date(policy.start_date);
        
        // Current policy year
        const currentPolicyYears = calculateYearsSince(startDate, currentDate);
        
        // What policy year will we be in at the projection date
        const projectedPolicyYears = calculateYearsSince(startDate, projectionDate);
        
        // If we will cross a policy anniversary within the next 12 months
        if (projectedPolicyYears > currentPolicyYears) {
          // Check if we're currently in year 0 (will get first year commission)
          if (currentPolicyYears === 0 && policy.first_year_commission) {
            projectedTotal += policy.first_year_commission;
          }
          // Otherwise we'll get ongoing commission
          else if (policy.annual_ongoing_commission) {
            const nextPolicyYear = currentPolicyYears + 1;
            const maxOngoingYears = 5;
            const policyRemainingYears = policy.policy_duration ? policy.policy_duration - 1 : Infinity;
            
            // Only count if we haven't exceeded the policy duration or max years
            if (nextPolicyYear <= Math.min(maxOngoingYears, policyRemainingYears)) {
              projectedTotal += policy.annual_ongoing_commission;
            }
          }
        }
      });
      
      return projectedTotal;
    },
  });

  // NEW: Fetch year to date commission
  const { data: yearToDateCommission, isLoading: isLoadingYtdCommission } = useQuery({
    queryKey: ["yearToDateCommission"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("start_date, first_year_commission, annual_ongoing_commission, policy_duration, status");
      
      if (error) throw error;
      
      let ytdTotal = 0;
      const startOfYear = new Date(currentYear, 0, 1);
      
      data.forEach(policy => {
        // Only consider active policies
        if (policy.status !== "active" || !policy.start_date) {
          return;
        }
        
        const startDate = new Date(policy.start_date);
        
        // If the policy started this year, add first year commission
        if (
          startDate.getFullYear() === currentYear && 
          policy.first_year_commission
        ) {
          ytdTotal += policy.first_year_commission;
        }
        
        // Check for ongoing commissions that were paid this year
        if (policy.annual_ongoing_commission) {
          const policyYears = calculateYearsSince(startDate, currentDate);
          
          // Skip first year (that's handled by first_year_commission)
          if (policyYears >= 1) {
            const renewalDate = new Date(startDate);
            renewalDate.setFullYear(currentYear);
            
            // If renewal date has passed this year, add the ongoing commission
            if (renewalDate <= currentDate && renewalDate >= startOfYear) {
              const maxOngoingYears = 5;
              const policyRemainingYears = policy.policy_duration ? policy.policy_duration - 1 : Infinity;
              const currentOngoingYear = policyYears; // This is the "ongoing year" (1-based)
              
              // Only count if we haven't exceeded the policy duration or max years
              if (currentOngoingYear <= Math.min(maxOngoingYears, policyRemainingYears)) {
                ytdTotal += policy.annual_ongoing_commission;
              }
            }
          }
        }
      });
      
      return ytdTotal;
    },
  });

  // NEW: Fetch upcoming renewals
  const { data: upcomingRenewals, isLoading: isLoadingRenewals } = useQuery({
    queryKey: ["upcomingRenewals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("start_date, end_date, status");
      
      if (error) throw error;
      
      // Look 30 days into the future
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      // Count policies with end dates in the next 30 days
      return data.filter(policy => {
        if (policy.status !== "active" || !policy.end_date) {
          return false;
        }
        
        const endDate = new Date(policy.end_date);
        return endDate >= currentDate && endDate <= futureDate;
      }).length;
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

  // NEW: Fetch commission goal (default to $10,000 if not set)
  const { data: commissionGoal, isLoading: isLoadingCommissionGoal } = useQuery({
    queryKey: ["commissionGoal"],
    queryFn: async () => {
      // In a real app, you'd fetch this from the user's settings
      // For now, we'll return a default value
      return 10000; // $10,000 default goal
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
        .limit(5);

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
    isLoadingRecentClients ||
    isLoadingPendingCommissions ||
    isLoadingProjectedIncome ||
    isLoadingYtdCommission ||
    isLoadingRenewals ||
    isLoadingCommissionGoal;

  return {
    totalCommission,
    activeClients,
    activePolicies,
    pendingTasks,
    annualCommission,
    pipelineData,
    upcomingTasks,
    recentClients,
    pendingCommissions,
    projectedIncome,
    yearToDateCommission,
    upcomingRenewals,
    commissionGoal,
    isLoading,
  };
}
