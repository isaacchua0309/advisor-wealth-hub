
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { ClientDetailsCard } from "@/components/clients/ClientDetailsCard";
import { PolicyList } from "@/components/clients/PolicyList";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Client } from "@/types/client";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useClient, useClientPolicies } = useClients();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      const { data, error } = await supabase
        .from('clients')
        .update({ pipeline_stage: newStage })
        .eq('id', client.id)
        .select()
        .single();

      if (error) throw error;

      // Optimistically update the local state
      queryClient.setQueryData(['clients', id], data);
      
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

  return (
    <div className="space-y-6">
      <div>
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
      </div>

      <div className="flex flex-col gap-6">
        <ClientDetailsCard 
          client={client} 
          onPipelineStageChange={handlePipelineStageChange} 
        />
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Policies</h2>
          <PolicyList policies={policies || []} />
        </div>
      </div>
    </div>
  );
}
