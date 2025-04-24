import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import type { Client } from "@/types/client";
import type { Policy } from "@/types/policy";
import { Badge } from "@/components/ui/badge";

interface ClientsTableProps {
  clients: Client[];
  policies?: Record<string, Policy[]>;
  isLoading: boolean;
  onClientSelect?: (clientIds: string[]) => void;
}

export function ClientsTable({ clients, policies = {}, isLoading, onClientSelect }: ClientsTableProps) {
  const navigate = useNavigate();
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleCheckboxChange = (checked: boolean, clientId: string) => {
    if (checked) {
      setSelectedClients([...selectedClients, clientId]);
    } else {
      setSelectedClients(selectedClients.filter(id => id !== clientId));
    }
    
    if (onClientSelect) {
      onClientSelect(checked 
        ? [...selectedClients, clientId] 
        : selectedClients.filter(id => id !== clientId)
      );
    }
  };

  const getPipelineStageBadgeVariant = (stage: Client['pipeline_stage']) => {
    switch (stage) {
      case 'Lead': return 'secondary';
      case 'Contacted': return 'outline';
      case 'Proposal Sent': return 'default';
      case 'Negotiation': return 'warning';
      case 'Closed Won': return 'success';
      case 'Closed Lost': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (clients.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          No clients found matching your search.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {onClientSelect && <TableHead className="w-12"></TableHead>}
          <TableHead>Name</TableHead>
          <TableHead>Contact Information</TableHead>
          <TableHead>Occupation</TableHead>
          <TableHead>Age Group</TableHead>
          <TableHead>Policies</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const clientPolicies = policies[client.id] || [];
          
          return (
            <TableRow
              key={client.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              {onClientSelect && (
                <TableCell onClick={(e) => e.stopPropagation()} className="px-4">
                  <Checkbox 
                    checked={selectedClients.includes(client.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, client.id)} 
                  />
                </TableCell>
              )}
              <TableCell className="font-medium" onClick={() => handleRowClick(client.id)}>
                {client.name}
              </TableCell>
              <TableCell onClick={() => handleRowClick(client.id)}>
                <div>{client.email}</div>
                <div className="text-sm text-muted-foreground">{client.phone}</div>
              </TableCell>
              <TableCell onClick={() => handleRowClick(client.id)}>
                {client.occupation}
              </TableCell>
              <TableCell onClick={() => handleRowClick(client.id)}>
                {client.age_group}
              </TableCell>
              <TableCell onClick={() => handleRowClick(client.id)}>
                {clientPolicies.length > 0 ? (
                  <div className="space-y-1">
                    {clientPolicies.slice(0, 2).map((policy) => (
                      <div key={policy.id} className="text-xs px-2 py-1 bg-muted rounded-md inline-block mr-1">
                        {policy.policy_name || policy.policy_type}
                      </div>
                    ))}
                    {clientPolicies.length > 2 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        +{clientPolicies.length - 2} more
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No policies</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getPipelineStageBadgeVariant(client.pipeline_stage)}>
                  {client.pipeline_stage}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleRowClick(client.id)}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
