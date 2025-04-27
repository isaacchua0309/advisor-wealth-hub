
import { Card, CardContent } from "@/components/ui/card";

interface GlobalPolicyKpiCardsProps {
  totalActivePolicies: number;
  avgFirstYearCommission: number;
  topProvider: string;
  avgPolicyDuration: number;
}

export function GlobalPolicyKpiCards({
  totalActivePolicies,
  avgFirstYearCommission,
  topProvider,
  avgPolicyDuration
}: GlobalPolicyKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Total Active Global Policies</span>
          <span className="text-2xl font-bold mt-1">{totalActivePolicies}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Avg First-Year Commission</span>
          <span className="text-2xl font-bold mt-1">{avgFirstYearCommission}%</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Top Provider</span>
          <span className="text-2xl font-bold mt-1 truncate">{topProvider}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Avg Policy Duration</span>
          <span className="text-2xl font-bold mt-1">{avgPolicyDuration} years</span>
        </div>
      </Card>
    </div>
  );
}
