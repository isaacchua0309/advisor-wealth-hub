
import { useState, useEffect } from "react";
import { useClients } from "@/hooks/useClients";
import { Policy } from "@/types/policy";
import { Card } from "@/components/ui/card";
import PolicyFilters from "@/components/policies/PolicyFilters";
import PoliciesTable from "@/components/policies/PoliciesTable";
import { Loader2 } from "lucide-react";

// Define filter state type
export type PolicyFilters = {
  search: string;
  policyType: string;
  paymentStructure: string;
  status: string;
  policyDuration: [number, number];
  premiumRange: [number, number];
  commissionRange: [number, number];
  firstYearCommissionRange: [number, number];
};

export default function Policies() {
  // Get policies data
  const { policies, isLoadingPolicies } = useClients();
  
  // State for filtered policies
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  
  // Initialize filter state with non-empty default values
  const [filters, setFilters] = useState<PolicyFilters>({
    search: "",
    policyType: "all",
    paymentStructure: "all",
    status: "all",
    policyDuration: [0, 100],
    premiumRange: [0, 1000000],
    commissionRange: [0, 100],
    firstYearCommissionRange: [0, 100000],
  });

  // Initial filter ranges based on data
  const [maxPremium, setMaxPremium] = useState(1000000);
  const [maxFirstYearCommission, setMaxFirstYearCommission] = useState(100000);

  // Calculate max values for sliders when data loads
  useEffect(() => {
    if (policies) {
      const maxPrem = Math.max(...policies.map(p => p.premium || 0), 1000);
      const maxComm = Math.max(...policies.map(p => p.first_year_commission || 0), 1000);
      
      setMaxPremium(maxPrem);
      setMaxFirstYearCommission(maxComm);
      
      setFilters(prev => ({
        ...prev,
        premiumRange: [0, maxPrem],
        firstYearCommissionRange: [0, maxComm]
      }));
    }
  }, [policies]);

  // Filter policies based on current filters
  useEffect(() => {
    if (!policies) {
      setFilteredPolicies([]);
      return;
    }

    // Convert policies to the correct type before filtering
    const typedPolicies = policies.map(policy => ({
      ...policy,
      // Ensure payment_structure_type is one of the allowed values
      payment_structure_type: policy.payment_structure_type as Policy['payment_structure_type']
    })) as Policy[];

    const filtered = typedPolicies.filter(policy => {
      // Search by policy name (case insensitive)
      const searchMatch = !filters.search || 
        policy.policy_name.toLowerCase().includes(filters.search.toLowerCase());
      
      // Filter by policy type
      const typeMatch = filters.policyType === "all" || 
        policy.policy_type === filters.policyType;
      
      // Filter by payment structure
      const paymentStructureMatch = filters.paymentStructure === "all" || 
        policy.payment_structure_type === filters.paymentStructure;
      
      // Filter by status
      const statusMatch = filters.status === "all" || 
        policy.status === filters.status;
      
      // Filter by policy duration
      const durationMatch = !policy.policy_duration || 
        (policy.policy_duration >= filters.policyDuration[0] && 
         policy.policy_duration <= filters.policyDuration[1]);
      
      // Filter by premium range
      const premiumMatch = !policy.premium || 
        (policy.premium >= filters.premiumRange[0] && 
         policy.premium <= filters.premiumRange[1]);
      
      // Filter by commission rate
      const commissionMatch = !policy.commission_rate || 
        (policy.commission_rate >= filters.commissionRange[0] && 
         policy.commission_rate <= filters.commissionRange[1]);
      
      // Filter by first year commission
      const firstYearCommissionMatch = !policy.first_year_commission || 
        (policy.first_year_commission >= filters.firstYearCommissionRange[0] && 
         policy.first_year_commission <= filters.firstYearCommissionRange[1]);
      
      return searchMatch && typeMatch && paymentStructureMatch && statusMatch && 
        durationMatch && premiumMatch && commissionMatch && firstYearCommissionMatch;
    });
    
    setFilteredPolicies(filtered);
  }, [policies, filters]);

  const clearFilters = () => {
    setFilters({
      search: "",
      policyType: "all",
      paymentStructure: "all",
      status: "all",
      policyDuration: [0, 100],
      premiumRange: [0, maxPremium],
      commissionRange: [0, 100],
      firstYearCommissionRange: [0, maxFirstYearCommission],
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Policies</h2>
          <p className="text-muted-foreground">
            View and manage all your client policies.
          </p>
        </div>
      </div>
      
      <Card className="mb-6 p-4">
        <PolicyFilters 
          filters={filters} 
          setFilters={setFilters}
          clearFilters={clearFilters}
          maxPremium={maxPremium}
          maxFirstYearCommission={maxFirstYearCommission}
        />
      </Card>
      
      {isLoadingPolicies ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPolicies && filteredPolicies.length > 0 ? (
        <PoliciesTable policies={filteredPolicies} />
      ) : (
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
      )}
    </div>
  );
}
