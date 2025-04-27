
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Policy } from "@/types/policy";
import { formatCurrency } from "./PolicyUtils";
import { calculateNextRenewalDate, isRenewingSoon, calculateYearlyCommissions } from "./PolicyUtils";

interface PolicyKPICardsProps {
  policies: Policy[];
}

/**
 * Helper function to calculate the KPI metrics for total collected commission and this year's commission
 */
const calculateKpiMetrics = (policies: Policy[]) => {
  // Filter active policies
  const activePolicies = policies.filter(p => p.status?.toLowerCase() === "active");
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  
  let totalCollectedCommission = 0;
  let thisYearCommission = 0;
  
  activePolicies.forEach(policy => {
    if (policy.start_date) {
      const startDate = new Date(policy.start_date);
      const startYear = startDate.getFullYear();
      const yearsPassed = currentYear - startYear;
      
      // First year commission - check if we've passed the policy start date
      if (yearsPassed >= 0) {
        const anniversaryDatePassed = 
          yearsPassed > 0 || 
          (currentMonth > startDate.getMonth() || 
           (currentMonth === startDate.getMonth() && currentDay >= startDate.getDate()));
        
        if (anniversaryDatePassed) {
          // Add to total collected
          totalCollectedCommission += policy.first_year_commission || 0;
          
          // Add to this year's commission if the policy started this year
          if (startYear === currentYear) {
            thisYearCommission += policy.first_year_commission || 0;
          }
        }
      }
      
      // Calculate ongoing commissions for years after the first
      if (yearsPassed > 0 && policy.annual_ongoing_commission) {
        // For total collected: all full years of ongoing commission
        const fullYearsOfOngoing = Math.min(
          yearsPassed, 
          policy.commission_duration ? policy.commission_duration - 1 : 0
        );
        
        totalCollectedCommission += fullYearsOfOngoing * (policy.annual_ongoing_commission || 0);
        
        // For this year's commission: only include if we've passed the anniversary date this year
        const anniversaryDateThisYear = new Date(currentYear, startDate.getMonth(), startDate.getDate());
        if (currentDate >= anniversaryDateThisYear && yearsPassed <= (policy.commission_duration || 0)) {
          thisYearCommission += policy.annual_ongoing_commission || 0;
        }
      }
    }
  });
  
  return {
    totalCollectedCommission,
    thisYearCommission
  };
};

export default function PolicyKPICards({ policies }: PolicyKPICardsProps) {
  // Calculate KPIs
  const activePolicies = policies.filter(p => p.status?.toLowerCase() === "active");
  const totalActivePoliciesCount = activePolicies.length;
  
  // Get commission metrics
  const { totalCollectedCommission, thisYearCommission } = calculateKpiMetrics(policies);
  
  const policiesRenewingSoon = policies.filter(policy => 
    isRenewingSoon(policy, 90)
  ).length;
  
  const highestValuePolicy = policies.length > 0 
    ? [...policies].sort((a, b) => (b.value || 0) - (a.value || 0))[0]
    : null;
    
  // Get next year's projected commission
  const currentYear = new Date().getFullYear();
  const commissionProjection = calculateYearlyCommissions(policies, currentYear, 2);
  const nextYearCommission = commissionProjection.length > 1 ? commissionProjection[1].amount : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActivePoliciesCount}</div>
          <p className="text-xs text-muted-foreground">
            Total active policies in your portfolio
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Commission Collected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCollectedCommission)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total commission collected to date
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Year's Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(thisYearCommission)}
          </div>
          <p className="text-xs text-muted-foreground">
            Commission earned in {currentYear}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Year's Projection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(nextYearCommission)}
          </div>
          <p className="text-xs text-muted-foreground">
            Projected commission for {currentYear + 1}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Renewals This Quarter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{policiesRenewingSoon}</div>
          <p className="text-xs text-muted-foreground">
            Policies renewing in next 90 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Value Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate">
            {highestValuePolicy?.policy_name || "—"}
          </div>
          <p className="text-xs text-muted-foreground">
            {highestValuePolicy ? formatCurrency(highestValuePolicy.value) : "No policies"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
