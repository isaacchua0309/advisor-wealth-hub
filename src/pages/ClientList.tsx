
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { ClientSearchBar } from "@/components/clients/ClientSearchBar";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import { ClientsTable } from "@/components/clients/ClientsTable";
import type { CreateClientInput } from "@/types/client";

export default function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { clients, isLoading, createClient } = useClients();

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.phone && client.phone.includes(searchQuery))
  ) ?? [];

  const handleCreateClient = async (data: CreateClientInput) => {
    await createClient.mutateAsync(data);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage your client list and information
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
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
