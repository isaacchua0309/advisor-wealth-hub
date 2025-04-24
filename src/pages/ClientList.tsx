
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { ClientSearchBar } from "@/components/clients/ClientSearchBar";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsTable } from "@/components/clients/ClientsTable";
import type { CreateClientInput } from "@/types/client";
import type { CreatePolicyInput } from "@/types/policy";

export default function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { 
    clients, 
    isLoadingClients, 
    policies,
    isLoadingPolicies, 
    createClient,
    getPoliciesByClientId
  } = useClients();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery))
  ) ?? [];
  
  const policyMap = getPoliciesByClientId();

  const handleCreateClient = async (client: CreateClientInput, policies: CreatePolicyInput[]) => {
    await createClient.mutateAsync({ client, policies });
    setIsDialogOpen(false);
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
          <ClientSearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <CardContent className="p-0">
          <ClientsTable 
            clients={filteredClients}
            policies={policyMap}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
