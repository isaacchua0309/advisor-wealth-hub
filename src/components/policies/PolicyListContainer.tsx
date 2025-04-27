
import React from "react";
import { Policy } from "@/types/policy";
import PoliciesTable from "@/components/policies/PoliciesTable";
import { Loader2 } from "lucide-react";

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
      <div className="w-full overflow-x-auto">
        <PoliciesTable 
          policies={filteredPolicies}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={onSort}
        />
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
