
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Policy } from "@/types/policy";
import { formatCurrency } from "./PolicyUtils";
import { calculateNextRenewalDate, isRenewingSoon } from "./PolicyUtils";

interface PolicyKPICardsProps {
  policies: Policy[];
}

export default function PolicyKPICards({ policies }: PolicyKPICardsProps) {
  // Calculate KPIs
  const activePolicies = policies.filter(p => p.status?.toLowerCase() === "active");
  
  const totalActivePoliciesCount = activePolicies.length;
  
  const totalFirstYearCommission = activePolicies.reduce(
    (sum, policy) => sum + (policy.first_year_commission || 0), 
    0
  );
  
  const totalOngoingCommission = activePolicies.reduce(
    (sum, policy) => sum + (policy.annual_ongoing_commission || 0), 
    0
  );
  
  const policiesRenewingSoon = policies.filter(policy => 
    isRenewingSoon(policy, 90)
  ).length;
  
  const highestValuePolicy = policies.length > 0 
    ? [...policies].sort((a, b) => (b.value || 0) - (a.value || 0))[0]
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
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
          <CardTitle className="text-sm font-medium">First-Year Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalFirstYearCommission)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total from all active policies
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annual Ongoing Commission</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalOngoingCommission)}
          </div>
          <p className="text-xs text-muted-foreground">
            Yearly recurring revenue
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
