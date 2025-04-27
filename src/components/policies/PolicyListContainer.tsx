
import React from "react";
import { Policy } from "@/types/policy";
import PoliciesTable from "@/components/policies/PoliciesTable";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDaysUntilRenewal, formatCurrency } from "./PolicyUtils";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

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
          <TabsList className="mb-4 w-full md:w-auto flex">
            <TabsTrigger value="table" className="flex-1 md:flex-none">Table View</TabsTrigger>
            <TabsTrigger value="compact" className="flex-1 md:flex-none">Compact View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="w-full">
            <div className="w-full border rounded-md">
              <div className="responsive-table-container overflow-x-auto">
                <PoliciesTable 
                  policies={filteredPolicies}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  onSort={onSort}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="compact" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredPolicies.map((policy) => {
                const daysUntilRenewal = calculateDaysUntilRenewal(policy);
                const isRenewingSoon = daysUntilRenewal !== null && daysUntilRenewal <= 30;
                
                let statusVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "outline";
                if (policy.status === 'active') statusVariant = "success";
                else if (policy.status === 'pending') statusVariant = "warning";
                else if (policy.status === 'expired' || policy.status === 'cancelled') statusVariant = "destructive";
                
                return (
                  <div 
                    key={policy.id} 
                    className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
                      isRenewingSoon ? 'border-amber-300' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate max-w-[70%]">
                        <Link 
                          to={`/clients/${policy.client_id}#policies`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {policy.policy_name}
                        </Link>
                      </h3>
                      <Badge variant={statusVariant}>
                        {policy.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      {policy.policy_type} • {policy.provider || 'No provider'}
                    </div>
                    
                    {policy.end_date && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Ends: {new Date(policy.end_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {isRenewingSoon && (
                      <div className="mt-2 flex items-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[10px]">
                          Renews in {daysUntilRenewal} days
                        </Badge>
                      </div>
                    )}
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">First Year</p>
                        <p className="text-sm font-medium">{formatCurrency(policy.first_year_commission)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ongoing</p>
                        <p className="text-sm font-medium">{formatCurrency(policy.annual_ongoing_commission)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
