
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, Calendar, TrendingUp } from "lucide-react";

interface DashboardKPICardsProps {
  totalClients: number;
  activePolicies: number;
  pendingCommissions: number;
  projectedIncome: number;
  yearToDateCommission: number;
  upcomingRenewals: number;
}

export function DashboardKPICards({
  totalClients,
  activePolicies,
  pendingCommissions,
  projectedIncome,
  yearToDateCommission,
  upcomingRenewals,
}: DashboardKPICardsProps) {
  const kpis = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      description: "Active clients managed"
    },
    {
      label: "Active Policies",
      value: activePolicies,
      icon: FileText,
      description: "Total policies under management"
    },
    {
      label: "Pending Commissions",
      value: `$${pendingCommissions?.toLocaleString() || '0'}`,
      icon: DollarSign,
      description: "Outstanding commission payments"
    },
    {
      label: "Projected Income (12M)",
      value: `$${projectedIncome?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      description: "Expected earnings next 12 months"
    },
    {
      label: "YTD Commission",
      value: `$${yearToDateCommission?.toLocaleString() || '0'}`,
      icon: DollarSign,
      description: "Year to date earnings"
    },
    {
      label: "Upcoming Renewals",
      value: upcomingRenewals,
      icon: Calendar,
      description: "Policies renewing in next 90 days"
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight">
                  {kpi.value}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
