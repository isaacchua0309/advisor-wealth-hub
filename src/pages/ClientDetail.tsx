
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { ClientDetailsCard } from "@/components/clients/ClientDetailsCard";
import { PolicyList } from "@/components/clients/PolicyList";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Client } from "@/types/client";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useClient, useClientPolicies, deleteClient } = useClients();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { 
    data: client, 
    isLoading: isLoadingClient,
    error: clientError 
  } = useClient(id);
  
  const { 
    data: policies, 
    isLoading: isLoadingPolicies 
  } = useClientPolicies(id);

  const isLoading = isLoadingClient || isLoadingPolicies;

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div className="animate-pulse text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 mb-4"></div>
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (clientError || !client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Client Not Found</h2>
        <p className="text-muted-foreground mb-6">The client you are looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/clients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
      </div>
    );
  }

  const handlePipelineStageChange = async (newStage: Client['pipeline_stage']) => {
    try {
      await queryClient.fetchQuery({
        queryKey: ['clients', id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('clients')
            .update({ pipeline_stage: newStage })
            .eq('id', client.id)
            .select()
            .single();

          if (error) throw error;
          return data;
        },
      });
      
      // Update local cache
      queryClient.setQueryData(['clients', id], {
        ...client,
        pipeline_stage: newStage
      });
      
      toast({
        title: "Pipeline Stage Updated",
        description: `Client stage changed to ${newStage}`,
      });
    } catch (error) {
      console.error("Error updating pipeline stage:", error);
      toast({
        title: "Error",
        description: "Failed to update pipeline stage",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async () => {
    try {
      await deleteClient.mutateAsync(id!);
      toast({
        title: "Client Deleted",
        description: `${client.name} has been removed`,
      });
      
      // Navigate back to clients list
      navigate('/clients');
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  const handleClientUpdate = (updatedClient: Partial<Client>) => {
    // Update client data in the cache
    queryClient.setQueryData(['clients', id], {
      ...client,
      ...updatedClient
    });
    
    // Close the edit dialog
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{client.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Client</span>
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ClientDetailsCard 
          client={client} 
          onPipelineStageChange={handlePipelineStageChange} 
        />
        
        {/* Policy List with Add/Edit/Delete functionality */}
        {id && <PolicyList policies={policies || []} clientId={id} />}
      </div>
      
      {/* Edit Client Dialog */}
      {client && (
        <EditClientDialog
          client={client}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onClientUpdate={handleClientUpdate}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              and all associated policies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteClient}
              disabled={deleteClient.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClient.isPending ? "Deleting..." : "Delete Client"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
