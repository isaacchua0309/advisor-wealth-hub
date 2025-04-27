
import { Card, CardContent } from "@/components/ui/card";
import { Policy } from "@/types/policy";
import { calculateDaysUntilRenewal, formatCurrency } from "./PolicyUtils";

interface PoliciesKPIProps {
  policies: Policy[];
}

export default function PoliciesKPI({ policies }: PoliciesKPIProps) {
  const activePolicies = policies.filter(p => p.status === "active");
  const commissionCollected = policies.reduce((sum, p) => sum + (p.first_year_commission || 0), 0);
  const thisYearCommission = activePolicies.reduce((sum, p) => sum + (p.annual_ongoing_commission || 0), 0);
  const renewalsThisQuarter = policies.filter(p => {
    const daysUntil = calculateDaysUntilRenewal(p);
    return daysUntil !== null && daysUntil <= 90;
  }).length;
  
  const upcomingExpirations = policies.filter(policy => {
    if (!policy.end_date || policy.status !== "active") return false;
    const endDate = new Date(policy.end_date);
    const today = new Date();
    const daysUntilExpiration = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration >= 0 && daysUntilExpiration <= 90;
  }).length;
  
  const highestValuePolicy = policies.length > 0 
    ? [...policies].sort((a, b) => (b.value || 0) - (a.value || 0))[0]
    : null;

  const kpiCards = [
    {
      title: "Active Policies",
      value: activePolicies.length,
      description: "Total active policies",
    },
    {
      title: "Commission Collected",
      value: formatCurrency(commissionCollected),
      description: "Total commission collected",
      valueClassName: "text-green-600",
    },
    {
      title: "This Year's Commission",
      value: formatCurrency(thisYearCommission),
      description: "Commission earned this year",
      valueClassName: "text-blue-600",
    },
    {
      title: "Renewals This Quarter",
      value: renewalsThisQuarter,
      description: "Policies renewing in 90 days",
      valueClassName: renewalsThisQuarter > 0 ? "text-amber-600" : undefined,
    },
    {
      title: "Upcoming Expirations",
      value: upcomingExpirations,
      description: "Policies expiring in 90 days",
      valueClassName: upcomingExpirations > 0 ? "text-red-600" : undefined,
    },
    {
      title: "Highest Value Policy",
      value: highestValuePolicy?.policy_name || "—",
      description: highestValuePolicy ? formatCurrency(highestValuePolicy.value) : "No policies",
      valueClassName: "text-lg truncate",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">{card.title}</p>
            <p className={`text-2xl font-bold ${card.valueClassName || ''}`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
