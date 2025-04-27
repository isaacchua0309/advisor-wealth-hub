
import { useState } from "react";
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
import type { Client } from "@/types/client";
import type { Policy } from "@/types/policy";
import { PipelineStageIndicator } from "./PipelineStageIndicator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ClientStatusBadge } from "./ClientStatusBadge";
import { format, isValid } from "date-fns";
import { ChevronDown, ChevronRight, Mail, Phone } from "lucide-react";

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
  const [expandedClients, setExpandedClients] = useState<string[]>([]);

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
    return clientPolicies.reduce((sum, policy) => sum + (policy.value || 0), 0);
  };

  const toggleExpand = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId) 
        : [...prev, clientId]
    );
  };

  const getNextRenewalDate = (clientId: string): string => {
    const clientPolicies = policies[clientId] || [];
    const renewalDates = clientPolicies
      .filter(policy => policy.end_date)
      .map(policy => new Date(policy.end_date as string))
      .filter(date => isValid(date) && date > new Date())
      .sort((a, b) => a.getTime() - b.getTime());
    
    return renewalDates.length > 0 
      ? format(renewalDates[0], 'MMM d, yyyy')
      : '—';
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={9} className="text-center py-8">
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
        <TableCell colSpan={9} className="text-center py-8">
          No clients found matching your search.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10"></TableHead>
          {onClientSelect && <TableHead className="w-12"></TableHead>}
          <TableHead>Name</TableHead>
          <TableHead>Contact Information</TableHead>
          <TableHead>Occupation</TableHead>
          <TableHead>Age Group</TableHead>
          <TableHead>Policies</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Policy Value</TableHead>
          <TableHead>Next Renewal</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => {
          const clientPolicies = policies[client.id] || [];
          const clientValue = calculateClientValue(client.id);
          const nextRenewal = getNextRenewalDate(client.id);
          const isExpanded = expandedClients.includes(client.id);
          
          return (
            <>
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="py-2 w-10" onClick={(e) => toggleExpand(client.id, e)}>
                  <div className="flex justify-center">
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </TableCell>
                
                {onClientSelect && (
                  <TableCell onClick={(e) => e.stopPropagation()} className="px-4 w-12">
                    <Checkbox 
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, client.id)} 
                    />
                  </TableCell>
                )}
                
                <TableCell className="font-medium" onClick={() => handleRowClick(client.id)}>
                  <div className="flex items-center space-x-2">
                    <span>{client.name}</span>
                    <ClientStatusBadge client={client} policies={clientPolicies} />
                  </div>
                </TableCell>
                
                <TableCell onClick={() => handleRowClick(client.id)}>
                  <div className="flex flex-col gap-1">
                    {client.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[140px]">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell onClick={() => handleRowClick(client.id)}>
                  {client.occupation || <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                
                <TableCell onClick={() => handleRowClick(client.id)}>
                  {client.age_group || <span className="text-muted-foreground text-sm">—</span>}
                </TableCell>
                
                <TableCell onClick={() => handleRowClick(client.id)}>
                  {clientPolicies.length > 0 ? (
                    <div className="space-y-1">
                      <span className="font-medium">{clientPolicies.length}</span>
                      <div>
                        {clientPolicies.slice(0, 2).map((policy) => (
                          <div key={policy.id} className="text-xs px-2 py-1 bg-muted rounded-md inline-block mr-1 mb-1">
                            {policy.policy_name || policy.policy_type}
                          </div>
                        ))}
                        {clientPolicies.length > 2 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{clientPolicies.length - 2} more
                          </span>
                        )}
                      </div>
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
                
                <TableCell onClick={() => handleRowClick(client.id)}>
                  {nextRenewal !== '—' ? (
                    <span className="whitespace-nowrap">{nextRenewal}</span>
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
              
              {isExpanded && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={10} className="py-3 px-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Active Policies</h4>
                        {clientPolicies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {clientPolicies.map(policy => (
                              <div key={policy.id} className="bg-background border rounded-md p-2 text-sm">
                                <div className="font-medium">{policy.policy_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {policy.provider || 'No provider'} • 
                                  {policy.value ? ` $${policy.value.toLocaleString()}` : ' No value'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No policies found</div>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${client.email}`;
                          }}
                        >
                          Email Client
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/clients/${client.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          );
        })}
      </TableBody>
    </Table>
  );
}
