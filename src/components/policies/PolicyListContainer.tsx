
import React from "react";
import { Policy } from "@/types/policy";
import PoliciesTable from "@/components/policies/PoliciesTable";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PolicyListContainerProps {
  isLoadingPolicies: boolean;
  policies: Policy[] | null;
  filteredPolicies: Policy[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

export default function PolicyListContainer({
  isLoadingPolicies,
  policies,
  filteredPolicies,
  sortBy,
  sortDirection,
  onSort
}: PolicyListContainerProps) {
  if (isLoadingPolicies) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (filteredPolicies && filteredPolicies.length > 0) {
    return (
      <div className="w-full">
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="compact">Compact View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="w-full">
            <div className="responsive-table-container">
              <PoliciesTable 
                policies={filteredPolicies}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="compact" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPolicies.map((policy) => (
                <div 
                  key={policy.id} 
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm">{policy.policy_name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      policy.status === 'active' ? 'bg-green-100 text-green-800' : 
                      policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {policy.status}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {policy.policy_type} • {policy.provider || 'No provider'}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Premium</p>
                      <p className="text-sm font-medium">${policy.premium?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">First Year</p>
                      <p className="text-sm font-medium">${policy.first_year_commission?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">No Policies Found</h3>
        <p className="text-muted-foreground">
          {policies && policies.length > 0 
            ? "No policies match your current filters. Try adjusting your search criteria."
            : "No policies have been created yet. Add policies to your clients to see them here."}
        </p>
      </div>
    </div>
  );
}
