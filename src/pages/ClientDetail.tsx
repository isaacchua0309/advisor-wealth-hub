
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

// Mock client data
const mockClients = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@example.com", phone: "+65 9123 4567", occupation: "Software Engineer", ageGroup: "26-35", policies: 3, value: "S$350,000" },
  { id: "2", name: "Michael Tan", email: "michael.tan@example.com", phone: "+65 8765 4321", occupation: "Doctor", ageGroup: "36-45", policies: 2, value: "S$210,000" },
  { id: "3", name: "Priya Kumar", email: "priya.kumar@example.com", phone: "+65 9876 5432", occupation: "Teacher", ageGroup: "26-35", policies: 1, value: "S$125,000" },
  { id: "4", name: "David Wong", email: "david.wong@example.com", phone: "+65 8234 5678", occupation: "Business Owner", ageGroup: "46-55", policies: 4, value: "S$480,000" },
];

// Mock policies data
const mockPolicies = {
  "1": [
    { id: "p1", type: "Life Insurance", insurer: "Prudential", premium: "S$2,400/year", startDate: "2022-03-15", sumAssured: "S$200,000", fyc: "S$2,400", renewal: "S$480" },
    { id: "p2", type: "Health Insurance", insurer: "AIA", premium: "S$1,800/year", startDate: "2022-06-22", sumAssured: "S$100,000", fyc: "S$1,800", renewal: "S$360" },
    { id: "p3", type: "Investment", insurer: "Manulife", premium: "S$6,000/year", startDate: "2023-01-10", sumAssured: "S$50,000", fyc: "S$6,000", renewal: "S$1,200" },
  ],
  "2": [
    { id: "p4", type: "Life Insurance", insurer: "AXA", premium: "S$3,600/year", startDate: "2021-08-05", sumAssured: "S$150,000", fyc: "S$3,600", renewal: "S$720" },
    { id: "p5", type: "General Insurance", insurer: "NTUC Income", premium: "S$960/year", startDate: "2022-11-18", sumAssured: "S$60,000", fyc: "S$960", renewal: "S$192" },
  ],
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch the client data from an API
    const foundClient = mockClients.find(c => c.id === id);
    const clientPolicies = mockPolicies[id as keyof typeof mockPolicies] || [];
    
    setClient(foundClient);
    setPolicies(clientPolicies);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-12">
        <div className="animate-pulse text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 mb-4"></div>
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold">{client.name}</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p>{client.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p>{client.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupation</p>
              <p>{client.occupation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Age Group</p>
              <p>{client.ageGroup}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Policy Value</p>
              <p className="text-lg font-semibold">{client.value}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Client Portfolio</CardTitle>
            <CardDescription>Policies and financial products</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="policies">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="commissions">Commissions</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="policies" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Policy List ({policies.length})</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
                
                {policies.length > 0 ? policies.map(policy => (
                  <Card key={policy.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-semibold">{policy.type}</h4>
                          <p className="text-sm text-muted-foreground">{policy.insurer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{policy.premium}</p>
                          <p className="text-sm text-muted-foreground">Started {new Date(policy.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Sum Assured</p>
                          <p>{policy.sumAssured}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">First Year Commission</p>
                          <p>{policy.fyc}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Renewal Commission</p>
                          <p>{policy.renewal}</p>
                        </div>
                        <div className="text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <p>No policies found for this client.</p>
                    <Button className="mt-4">Add First Policy</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="commissions">
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Commission details will appear here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="notes">
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Client notes will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Plus } from "lucide-react";
