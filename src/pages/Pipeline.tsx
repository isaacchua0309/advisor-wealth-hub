
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/types/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClientSearchBar } from "@/components/clients/ClientSearchBar";
import { Loader2, Filter, Calendar, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PipelineStageIndicator } from "@/components/clients/PipelineStageIndicator";
import { ClientPipelineFilters } from "@/components/pipeline/ClientPipelineFilters";
import { format } from "date-fns";
import { ClientStatusBadge } from "@/components/clients/ClientStatusBadge";
import { PipelineKpiCards } from "@/components/pipeline/PipelineKpiCards";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
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
      
      // Toast notification was already implemented in updateClientPipelineStage function
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
  
  // Calculate pipeline metrics
  const calculatePipelineMetrics = () => {
    if (!clients || !policies) {
      return {
        openDeals: 0,
        pipelineValue: 0,
        averageDealSize: 0,
        winRate: 0
      };
    }
    
    // Open deals are all clients not in "Closed Won" or "Closed Lost" stages
    const openDeals = clients.filter(client => 
      client.pipeline_stage !== "Closed Won" && client.pipeline_stage !== "Closed Lost"
    ).length;
    
    // Pipeline value is the sum of all expected commissions for open deals
    let pipelineValue = 0;
    let totalDealSize = 0;
    
    clients.forEach(client => {
      if (client.pipeline_stage !== "Closed Won" && client.pipeline_stage !== "Closed Lost") {
        const clientValue = getClientValue(client.id);
        pipelineValue += clientValue;
        totalDealSize += clientValue;
      }
    });
    
    const averageDealSize = openDeals > 0 ? totalDealSize / openDeals : 0;
    
    // Win rate calculation
    const closedWon = clients.filter(client => client.pipeline_stage === "Closed Won").length;
    const closedLost = clients.filter(client => client.pipeline_stage === "Closed Lost").length;
    const winRate = closedWon + closedLost > 0 
      ? Math.round((closedWon / (closedWon + closedLost)) * 100) 
      : 0;
    
    return {
      openDeals,
      pipelineValue,
      averageDealSize,
      winRate
    };
  };
  
  // Calculate deals and value for each stage
  const calculateStageMetrics = (stage: Client["pipeline_stage"]) => {
    if (!clients) return { count: 0, value: 0 };
    
    const stageClients = clients.filter(client => client.pipeline_stage === stage);
    const totalValue = stageClients.reduce((total, client) => 
      total + getClientValue(client.id), 0);
    
    return {
      count: stageClients.length,
      value: totalValue
    };
  };

  const pipelineMetrics = calculatePipelineMetrics();

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

      {/* KPI Cards */}
      <PipelineKpiCards 
        openDeals={pipelineMetrics.openDeals}
        pipelineValue={pipelineMetrics.pipelineValue}
        averageDealSize={pipelineMetrics.averageDealSize}
        winRate={pipelineMetrics.winRate}
      />

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full overflow-visible">
            {PIPELINE_STAGES.map(stage => {
              const stageMetrics = calculateStageMetrics(stage);
              
              return (
                <div key={stage} className="flex flex-col h-full">
                  <div className="bg-muted px-3 py-2 rounded-t-md flex items-center justify-between">
                    <h3 className="font-medium text-sm">{stage}</h3>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {stageMetrics.count} {stageMetrics.count === 1 ? 'Deal' : 'Deals'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ${stageMetrics.value.toLocaleString()}
                      </Badge>
                    </div>
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
                                    <div className="flex justify-between items-start mb-1">
                                      <div className="font-medium line-clamp-1">{client.name}</div>
                                      <ClientStatusBadge client={client} policies={clientsPolicies} />
                                    </div>
                                    
                                    {clientsPolicies.length > 0 ? (
                                      <div className="space-y-1 mb-2">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <FileText className="h-3.5 w-3.5" />
                                          {clientsPolicies.length} {clientsPolicies.length === 1 ? 'Policy' : 'Policies'}:
                                          {clientsPolicies.slice(0, 2).map((policy, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] h-4 px-1">
                                              {policy.policy_type}
                                            </Badge>
                                          ))}
                                          {clientsPolicies.length > 2 && (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                                              +{clientsPolicies.length - 2} more
                                            </Badge>
                                          )}
                                        </div>
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
                                    
                                    {client.occupation && (
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                                        <User className="h-3 w-3" />
                                        {client.occupation}
                                      </div>
                                    )}
                                    
                                    <div className="space-y-1">
                                      <div className="flex justify-between items-center text-xs">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                      </div>
                                      <Progress value={progress} className="h-2" />
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
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
