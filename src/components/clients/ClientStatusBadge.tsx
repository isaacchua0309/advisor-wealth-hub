
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/types/client";
import type { Policy } from "@/types/policy";

interface ClientStatusBadgeProps {
  client: Client;
  policies?: Policy[];
}

export function ClientStatusBadge({ client, policies = [] }: ClientStatusBadgeProps) {
  // Calculate the client status based on pipeline stage and policies
  const status = getClientStatus(client, policies);
  
  return (
    <Badge 
      variant="outline" 
      className={`
        ${status.color} 
        flex items-center gap-1.5 
        whitespace-nowrap px-2 py-0.5
      `}
    >
      <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
      {status.label}
    </Badge>
  );
}

function getClientStatus(client: Client, policies: Policy[] = []) {
  // Active client with policies
  const hasActivePolicies = policies.some(p => p.status === 'active');
  
  // Client with renewals due soon (within 30 days)
  const hasUpcomingRenewals = policies.some(p => {
    if (!p.end_date) return false;
    const endDate = new Date(p.end_date);
    const daysUntilRenewal = Math.floor((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysUntilRenewal >= 0 && daysUntilRenewal <= 30;
  });

  // Determine status based on pipeline stage and policies
  if (client.pipeline_stage === 'Lead') {
    return {
      label: 'Lead',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
      dotColor: 'bg-gray-500'
    };
  } 
  else if (client.pipeline_stage === 'Closed Won' && hasActivePolicies) {
    return {
      label: 'Active Client',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      dotColor: 'bg-green-500'
    };
  }
  else if (hasUpcomingRenewals) {
    return {
      label: 'Renewal Due Soon',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotColor: 'bg-amber-500'
    };
  }
  else if (['Contacted', 'Proposal Sent', 'Negotiation'].includes(client.pipeline_stage)) {
    return {
      label: 'Needs Follow Up',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      dotColor: 'bg-blue-500'
    };
  }
  else if (client.pipeline_stage === 'Closed Lost') {
    return {
      label: 'Lost',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      dotColor: 'bg-red-500'
    };
  }
  
  // Default
  return {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    dotColor: 'bg-gray-500'
  };
}
