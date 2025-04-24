
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientFilters } from "@/components/clients/ClientFilters";
import type { Client, CreateClientInput } from "@/types/client";
import type { CreatePolicyInput } from "@/types/policy";

export default function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
    ageGroup: null as string | null,
    pipelineStage: null as Client['pipeline_stage'] | null,
    minValue: 0,
    maxValue: 1000000, // Default max value
  });
  
  const { 
    clients, 
    isLoadingClients, 
    policies,
    isLoadingPolicies, 
    createClient,
    getPoliciesByClientId,
    updateClientPipelineStage
  } = useClients();

  const policyMap = getPoliciesByClientId();

  const filteredClients = clients?.filter(client => {
    // Text search filter
    const textMatch = !searchQuery || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.phone && client.phone.includes(searchQuery));
    
    // Age group filter
    const ageGroupMatch = !filters.ageGroup || client.age_group === filters.ageGroup;
    
    // Pipeline stage filter
    const stageMatch = !filters.pipelineStage || client.pipeline_stage === filters.pipelineStage;
    
    // Value filter
    const clientPolicies = policyMap[client.id] || [];
    const clientValue = clientPolicies.reduce(
      (sum, policy) => sum + (policy.premium || 0), 
      0
    );
    const valueMatch = clientValue >= filters.minValue && clientValue <= filters.maxValue;
    
    return textMatch && ageGroupMatch && stageMatch && valueMatch;
  }) ?? [];
  
  const handleCreateClient = async (client: CreateClientInput, policies: CreatePolicyInput[]) => {
    await createClient.mutateAsync({ client, policies });
    setIsDialogOpen(false);
  };

  const handleClientStageChange = async (clientId: string, stage: Client['pipeline_stage']) => {
    await updateClientPipelineStage(clientId, stage);
  };

  const isLoading = isLoadingClients || isLoadingPolicies;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client list, contact information, and policies
          </p>
        </div>
        <AddClientDialog 
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateClient}
          isPending={createClient.isPending}
        />
      </div>

      <Card>
        <div className="p-4 border-b">
          <ClientFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
            policyMap={policyMap}
            isExpanded={isFiltersExpanded}
            onToggleExpand={() => setIsFiltersExpanded(!isFiltersExpanded)}
          />
        </div>
        <CardContent className="p-0">
          <ClientsTable 
            clients={filteredClients}
            policies={policyMap}
            isLoading={isLoading}
            onClientStageChange={handleClientStageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
