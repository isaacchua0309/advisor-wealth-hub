
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { ClientDetailsCard } from "@/components/clients/ClientDetailsCard";
import { PolicyList } from "@/components/clients/PolicyList";
import { useClients } from "@/hooks/useClients";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { useClient, useClientPolicies } = useClients();
  
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
        <ClientDetailsCard client={client} />
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Policies</h2>
          <PolicyList policies={policies || []} />
        </div>
      </div>
    </div>
  );
}
