
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/types/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientSearchBar } from "@/components/clients/ClientSearchBar";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PipelineStageIndicator } from "@/components/clients/PipelineStageIndicator";
import { ClientPipelineFilters } from "@/components/pipeline/ClientPipelineFilters";

// Pipeline stages in display order
const PIPELINE_STAGES = [
  "Lead",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

// Calculate stage progress percentage
const getStageProgress = (stage: Client["pipeline_stage"]): number => {
  const stageIndex = PIPELINE_STAGES.indexOf(stage);
  const totalStages = PIPELINE_STAGES.length - 1; // Exclude "Closed Lost" from calculation
  
  if (stage === "Closed Lost") return 0;
  return Math.round((stageIndex / (totalStages - 1)) * 100);
};

// Type for filters
type PipelineFilters = {
  search: string;
  stages: Client["pipeline_stage"][];
  policyTypes: string[];
};

export default function Pipeline() {
  const navigate = useNavigate();
  const { clients, policies, isLoadingClients, getPoliciesByClientId, updateClientPipelineStage } = useClients();
  
  // State for filtered clients
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // State for search term
  const [filters, setFilters] = useState<PipelineFilters>({
    search: "",
    stages: [...PIPELINE_STAGES],
    policyTypes: [],
  });

  // State for showing filters
  const [showFilters, setShowFilters] = useState(false);
  
  // Get policies by client
  const clientPolicies = getPoliciesByClientId();
  
  // Filter clients based on search and filters
  useEffect(() => {
    if (!clients) return;
    
    const filtered = clients.filter(client => {
      // Search filter
      const matchesSearch = filters.search.length === 0 || 
        client.name.toLowerCase().includes(filters.search.toLowerCase());
      
      // Stage filter
      const matchesStage = filters.stages.includes(client.pipeline_stage);
      
      // Policy type filter
      const clientHasPolicyTypes = filters.policyTypes.length === 0 || 
        (clientPolicies[client.id] && clientPolicies[client.id].some(
          policy => filters.policyTypes.includes(policy.policy_type))
        );
      
      return matchesSearch && matchesStage && clientHasPolicyTypes;
    });
    
    setFilteredClients(filtered);
  }, [clients, filters, clientPolicies]);

  // Handle drag end event
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStage = destination.droppableId as Client["pipeline_stage"];
    
    try {
      await updateClientPipelineStage(draggableId, newStage);
    } catch (error) {
      console.error("Failed to update client stage:", error);
    }
  };

  // Calculate client value based on policies
  const getClientValue = (clientId: string) => {
    if (!clientPolicies[clientId]) return 0;
    
    return clientPolicies[clientId].reduce((total, policy) => 
      total + (policy.first_year_commission || 0), 0);
  };

  // Get all unique policy types
  const getAllPolicyTypes = () => {
    if (!policies) return [];
    
    const types = new Set<string>();
    policies.forEach(policy => {
      if (policy.policy_type) {
        types.add(policy.policy_type);
      }
    });
    
    return Array.from(types);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Pipeline</h2>
          <p className="text-muted-foreground">
            Visualize your deal pipeline and track progress.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <ClientSearchBar value={filters.search} onChange={handleSearchChange} />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-4 p-4">
          <ClientPipelineFilters
            filters={filters}
            setFilters={setFilters}
            allPolicyTypes={getAllPolicyTypes()}
          />
        </Card>
      )}

      {isLoadingClients ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full">
            {PIPELINE_STAGES.map(stage => (
              <div key={stage} className="flex flex-col h-full">
                <div className="bg-muted px-3 py-2 rounded-t-md flex items-center justify-between">
                  <h3 className="font-medium text-sm">{stage}</h3>
                  <Badge variant="outline" className="text-xs">
                    {filteredClients.filter(c => c.pipeline_stage === stage).length}
                  </Badge>
                </div>
                
                <Droppable droppableId={stage} key={stage}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex-1 bg-muted/30 rounded-b-md overflow-y-auto p-2 min-h-[500px]"
                    >
                      {filteredClients
                        .filter(client => client.pipeline_stage === stage)
                        .map((client, index) => {
                          const clientValue = getClientValue(client.id);
                          const progress = getStageProgress(client.pipeline_stage);
                          const clientsPolicies = clientPolicies[client.id] || [];
                          
                          return (
                            <Draggable
                              key={client.id}
                              draggableId={client.id}
                              index={index}
                            >
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-2 p-3 hover:border-primary/50 cursor-pointer"
                                  onClick={() => navigate(`/clients/${client.id}`)}
                                >
                                  <div className="font-medium mb-1">{client.name}</div>
                                  
                                  {clientsPolicies.length > 0 ? (
                                    <div className="space-y-1 mb-2">
                                      {clientsPolicies.slice(0, 1).map(policy => (
                                        <div key={policy.id} className="text-xs">
                                          {policy.policy_type}
                                          {policy.policy_number && ` • ${policy.policy_number}`}
                                        </div>
                                      ))}
                                      {clientsPolicies.length > 1 && (
                                        <div className="text-xs text-muted-foreground">
                                          +{clientsPolicies.length - 1} more policies
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground mb-2">
                                      No policies
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-muted-foreground">Commission</span>
                                    <span className="font-medium">
                                      ${clientValue.toLocaleString()}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                      <span>Progress</span>
                                      <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1" />
                                  </div>
                                </Card>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
