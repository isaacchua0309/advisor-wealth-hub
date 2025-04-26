
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlobalPolicyTable } from "@/components/global-policies/GlobalPolicyTable";
import { GlobalPolicyFilters } from "@/components/global-policies/GlobalPolicyFilters";
import { AddGlobalPolicyDialog } from "@/components/global-policies/AddGlobalPolicyDialog";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { Loader2, Plus } from "lucide-react";

// Define filter state type
export type GlobalPolicyFilters = {
  search: string;
  policyType: string;
  paymentStructure: string;
  premiumRange: [number, number];
  commissionRange: [number, number];
  durationRange: [number, number];
};

export default function GlobalPolicies() {
  // Get policies data
  const { globalPolicies, isLoadingPolicies } = useGlobalPolicies();
  
  // State for add policy dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // State for filtered policies
  const [filteredPolicies, setFilteredPolicies] = useState(globalPolicies || []);
  
  // Initialize filter state with non-empty default values
  const [filters, setFilters] = useState<GlobalPolicyFilters>({
    search: "",
    policyType: "all",
    paymentStructure: "all",
    premiumRange: [0, 1000000],
    commissionRange: [0, 100],
    durationRange: [0, 30],
  });

  // Initial filter ranges based on data
  const [maxPremium, setMaxPremium] = useState(1000000);

  // Filter policies based on current filters
  useEffect(() => {
    if (!globalPolicies) {
      setFilteredPolicies([]);
      return;
    }

    const filtered = globalPolicies.filter(policy => {
      // Search by policy name (case insensitive)
      const searchMatch = !filters.search || 
        policy.policy_name.toLowerCase().includes(filters.search.toLowerCase());
      
      // Filter by policy type
      const typeMatch = filters.policyType === "all" || 
        policy.policy_type === filters.policyType;
      
      // Filter by payment structure
      const paymentStructureMatch = filters.paymentStructure === "all" || 
        policy.payment_structure_type === filters.paymentStructure;
      
      // Filter by premium range
      const premiumMatch = !policy.premium || 
        (policy.premium >= filters.premiumRange[0] && 
         policy.premium <= filters.premiumRange[1]);
      
      // Filter by commission rate
      const commissionMatch = !policy.commission_rate || 
        (policy.commission_rate >= filters.commissionRange[0] && 
         policy.commission_rate <= filters.commissionRange[1]);
      
      // Filter by duration range
      const durationMatch = !policy.policy_duration || 
        (policy.policy_duration >= filters.durationRange[0] && 
         policy.policy_duration <= filters.durationRange[1]);
      
      return searchMatch && typeMatch && paymentStructureMatch && 
        premiumMatch && commissionMatch && durationMatch;
    });
    
    setFilteredPolicies(filtered);
  }, [globalPolicies, filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      policyType: "all",
      paymentStructure: "all",
      premiumRange: [0, maxPremium],
      commissionRange: [0, 100],
      durationRange: [0, 30],
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Global Policies</h2>
          <p className="text-muted-foreground">
            Manage your global policy templates that can be assigned to clients.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Policy
        </Button>
      </div>
      
      <Card className="mb-6 p-4">
        <GlobalPolicyFilters 
          filters={filters} 
          setFilters={setFilters}
          clearFilters={clearFilters}
          maxPremium={maxPremium}
        />
      </Card>
      
      {isLoadingPolicies ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPolicies && filteredPolicies.length > 0 ? (
        <GlobalPolicyTable
          policies={filteredPolicies}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Global Policies Found</h3>
            <p className="text-muted-foreground">
              {globalPolicies && globalPolicies.length > 0 
                ? "No policies match your current filters. Try adjusting your search criteria."
                : "No global policies have been created yet. Add policies to see them here."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Policy
            </Button>
          </div>
        </div>
      )}
      
      <AddGlobalPolicyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
