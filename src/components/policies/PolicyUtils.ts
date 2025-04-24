
import type { Policy } from "@/types/policy";
import { Badge } from "@/components/ui/badge";

// Get payment structure label from type
export function getPaymentStructureLabel(type: Policy["payment_structure_type"]) {
  const structures: Record<string, string> = {
    single_premium: "Single Premium",
    one_year_term: "One-Year Term",
    regular_premium: "Regular Premium",
    five_year_premium: "5-Year Premium",
    ten_year_premium: "10-Year Premium",
    lifetime_premium: "Lifetime Premium"
  };
  
  return structures[type] || type;
}

// Format currency amount
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "N/A";
  return `$${amount.toLocaleString()}`;
}

// Format percentage
export function formatPercentage(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) return "N/A";
  return `${percent}%`;
}

// Get status badge with appropriate color
export function getStatusBadge(status: string | null) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { variant: "default" },
    inactive: { variant: "secondary" },
    expired: { variant: "outline" },
    cancelled: { variant: "destructive" },
    pending: { variant: "outline" }
  };
  
  const statusConfig = statusMap[status.toLowerCase()] || { variant: "outline" };
  
  return (
    <Badge variant={statusConfig.variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Calculate total value of a policy group
export function calculateTotalPremium(policies: Policy[]): number {
  return policies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
}

// Calculate total commission of a policy group
export function calculateTotalCommission(policies: Policy[]): number {
  return policies.reduce((sum, policy) => sum + (policy.first_year_commission || 0), 0);
}
