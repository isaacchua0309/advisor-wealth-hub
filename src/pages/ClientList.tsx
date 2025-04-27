
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientKPICards } from "@/components/clients/ClientKPICards";
import type { Client, CreateClientInput } from "@/types/client";
import type { CreatePolicyInput } from "@/types/policy";
import { addDays, isWithinInterval, parseISO, isValid } from "date-fns";

export default function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<ClientFilters>({
    ageGroup: null,
    pipelineStage: null,
    policyType: null,
    occupation: null,
    renewalPeriod: null,
    minValue: 0,
    maxValue: 1000000,
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
    
    // Policy type filter
    const policyTypeMatch = !filters.policyType || (policyMap[client.id] || []).some(
      policy => policy.policy_type === filters.policyType
    );

    // Occupation filter 
    const occupationMatch = !filters.occupation || client.occupation === filters.occupation;

    // Renewal period filter
    const renewalPeriodMatch = !filters.renewalPeriod || (policyMap[client.id] || []).some(policy => {
      if (!policy.end_date) return false;
      
      const endDate = parseISO(policy.end_date);
      if (!isValid(endDate)) return false;
      
      const today = new Date();
      const futureDate = addDays(today, parseInt(filters.renewalPeriod as string, 10));
      
      return isWithinInterval(endDate, { start: today, end: futureDate });
    });
    
    // Value filter
    const clientPolicies = policyMap[client.id] || [];
    const clientValue = clientPolicies.reduce(
      (sum, policy) => sum + (policy.value || 0), 
      0
    );
    const valueMatch = clientValue >= filters.minValue && clientValue <= filters.maxValue;
    
    return textMatch && 
           ageGroupMatch && 
           stageMatch && 
           policyTypeMatch && 
           occupationMatch && 
           renewalPeriodMatch && 
           valueMatch;
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

      {/* KPI Cards Section */}
      <ClientKPICards />

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
