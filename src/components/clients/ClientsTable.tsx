
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
import { PipelineStageIndicator } from "./PipelineStageIndicator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ClientsTableProps {
  clients: Client[];
  policies?: Record<string, Policy[]>;
  isLoading: boolean;
  onClientSelect?: (clientIds: string[]) => void;
  onClientStageChange?: (clientId: string, stage: Client['pipeline_stage']) => Promise<void>;
}

export function ClientsTable({ 
  clients, 
  policies = {}, 
  isLoading, 
  onClientSelect,
  onClientStageChange
}: ClientsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // Handle pipeline stage change directly in the table
  const handleStageChange = async (clientId: string, newStage: Client['pipeline_stage']) => {
    try {
      if (onClientStageChange) {
        await onClientStageChange(clientId, newStage);
      } else {
        // If no handler is provided, update directly
        const { error } = await supabase
          .from('clients')
          .update({ pipeline_stage: newStage })
          .eq('id', clientId);

        if (error) throw error;

        // Update local cache
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        
        toast({
          title: "Pipeline Stage Updated",
          description: `Client stage changed to ${newStage}`
        });
      }
    } catch (error) {
      console.error("Failed to update client stage:", error);
      toast({
        title: "Update Failed",
        description: "Could not update pipeline stage",
        variant: "destructive",
      });
    }
  };

  const calculateClientValue = (clientId: string): number => {
    const clientPolicies = policies[clientId] || [];
    return clientPolicies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8">
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
        <TableCell colSpan={7} className="text-center py-8">
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
          <TableHead>Value</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const clientPolicies = policies[client.id] || [];
          const clientValue = calculateClientValue(client.id);
          
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
              <TableCell onClick={(e) => e.stopPropagation()}>
                <PipelineStageIndicator 
                  stage={client.pipeline_stage}
                  clientId={client.id}
                  isEditable={true}
                  onStageChange={(stage) => handleStageChange(client.id, stage)}
                />
              </TableCell>
              <TableCell onClick={() => handleRowClick(client.id)}>
                {clientValue > 0 ? (
                  <span className="font-medium">${clientValue.toLocaleString()}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
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
