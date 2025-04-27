
import { useClients } from "@/hooks/useClients";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, AlertCircle, DollarSign } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientKPICards() {
  const { clients, isLoadingClients, policies, isLoadingPolicies } = useClients();
  
  // Calculate KPIs
  const totalClients = clients?.length || 0;
  
  // Clients with active policies
  const clientsWithActivePolicies = policies 
    ? [...new Set(policies.filter(p => p.status === 'active').map(p => p.client_id))].length
    : 0;
  
  // Clients needing attention: Leads not moved in 30 days or clients without recent contact
  const clientsNeedingAttention = clients?.filter(client => {
    // Consider leads that haven't progressed
    return client.pipeline_stage === 'Lead' || client.pipeline_stage === 'Contacted';
  }).length || 0;
  
  // Total policy value
  const totalPolicyValue = policies?.reduce((sum, policy) => sum + (policy.value || 0), 0) || 0;
  
  const kpis = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      description: "All clients in your database"
    },
    {
      title: "With Active Policies",
      value: clientsWithActivePolicies,
      icon: UserCheck,
      description: "Clients with revenue-generating policies"
    },
    {
      title: "Needing Attention",
      value: clientsNeedingAttention,
      icon: AlertCircle,
      description: "Leads or inactive clients requiring follow-up"
    },
    {
      title: "Total Policy Value",
      value: `$${totalPolicyValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Estimated value of all client policies"
    }
  ];

  if (isLoadingClients || isLoadingPolicies) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <kpi.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <h4 className="text-2xl font-bold tracking-tight">{kpi.value}</h4>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
