
import { useState, useEffect } from "react";
import { useClients } from "@/hooks/useClients";
import { Policy } from "@/types/policy";
import { Card } from "@/components/ui/card";
import PolicyFilters from "@/components/policies/PolicyFilters";
import PoliciesTable from "@/components/policies/PoliciesTable";
import { Loader2 } from "lucide-react";
import PolicyKPICards from "@/components/policies/PolicyKPICards";
import CommissionProjectionChart from "@/components/policies/CommissionProjectionChart";
import { calculateTotalExpectedCommission } from "@/components/policies/PolicyUtils";

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
  showRenewingThisYear: boolean;
  showTopByCommission: boolean;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

export default function Policies() {
  // Get policies data
  const { policies, isLoadingPolicies } = useClients();
  
  // State for filtered policies
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  
  // State for year selection (for highlighting in the projection chart)
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
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
    showRenewingThisYear: false,
    showTopByCommission: false,
    sortBy: "policy_name",
    sortDirection: "asc"
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

  // Filter and sort policies based on current filters
  useEffect(() => {
    if (!policies) {
      setFilteredPolicies([]);
      return;
    }

    // Make TypeScript happy by explicitly casting policies to Policy[]
    const typedPolicies = policies as Policy[];

    let filtered = typedPolicies.filter(policy => {
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
      
      // Filter for policies renewing this year
      const renewingThisYearMatch = !filters.showRenewingThisYear || isRenewingThisYear(policy);
      
      // If a specific year is selected, filter by policies active that year
      const yearMatch = selectedYear === null || isPolicyActiveInYear(policy, selectedYear);
      
      return searchMatch && typeMatch && paymentStructureMatch && statusMatch && 
        durationMatch && premiumMatch && commissionMatch && firstYearCommissionMatch &&
        renewingThisYearMatch && yearMatch;
    });
    
    // Sort policies based on selected sort option
    filtered = sortPolicies(filtered, filters.sortBy, filters.sortDirection);
    
    // Apply top 10 by commission filter if selected
    if (filters.showTopByCommission) {
      filtered = filtered
        .sort((a, b) => {
          const commissionA = calculateTotalExpectedCommission(a);
          const commissionB = calculateTotalExpectedCommission(b);
          return commissionB - commissionA;
        })
        .slice(0, 10);
    }
    
    setFilteredPolicies(filtered);
  }, [policies, filters, selectedYear]);

  // Check if a policy is renewing this year
  const isRenewingThisYear = (policy: Policy): boolean => {
    if (!policy.start_date) return false;
    
    const startDate = new Date(policy.start_date);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Create the next renewal date for this year
    const renewalDate = new Date(startDate);
    renewalDate.setFullYear(currentYear);
    
    // If the renewal date has passed, check next year's renewal
    if (renewalDate < currentDate) {
      renewalDate.setFullYear(currentYear + 1);
    }
    
    // Check if renewal is within this calendar year
    return renewalDate.getFullYear() === currentYear;
  };
  
  // Check if a policy is active in a given year
  const isPolicyActiveInYear = (policy: Policy, year: number): boolean => {
    if (!policy.start_date) return false;
    
    const startDate = new Date(policy.start_date);
    const startYear = startDate.getFullYear();
    
    // If the policy has an end date, check if the year is within the range
    if (policy.end_date) {
      const endDate = new Date(policy.end_date);
      const endYear = endDate.getFullYear();
      return year >= startYear && year <= endYear;
    }
    
    // If the policy has a commission duration, calculate end year
    if (policy.commission_duration) {
      const endYear = startYear + policy.commission_duration;
      return year >= startYear && year <= endYear;
    }
    
    // Default: assume policy is active if it has started
    return year >= startYear;
  };
  
  // Sort policies based on selected criteria
  const sortPolicies = (policies: Policy[], sortBy: string, sortDirection: "asc" | "desc"): Policy[] => {
    return [...policies].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortBy) {
        case "policy_name":
          valueA = a.policy_name || "";
          valueB = b.policy_name || "";
          return sortDirection === "asc" 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
          
        case "premium":
          valueA = a.premium || 0;
          valueB = b.premium || 0;
          break;
          
        case "value":
          valueA = a.value || 0;
          valueB = b.value || 0;
          break;
          
        case "first_year_commission":
          valueA = a.first_year_commission || 0;
          valueB = b.first_year_commission || 0;
          break;
          
        case "annual_ongoing_commission":
          valueA = a.annual_ongoing_commission || 0;
          valueB = b.annual_ongoing_commission || 0;
          break;
          
        case "total_expected_commission":
          valueA = calculateTotalExpectedCommission(a);
          valueB = calculateTotalExpectedCommission(b);
          break;
          
        case "policy_age":
          valueA = a.start_date ? new Date().getTime() - new Date(a.start_date).getTime() : 0;
          valueB = b.start_date ? new Date().getTime() - new Date(b.start_date).getTime() : 0;
          break;
          
        case "start_date":
          valueA = a.start_date ? new Date(a.start_date).getTime() : 0;
          valueB = b.start_date ? new Date(b.start_date).getTime() : 0;
          break;
          
        default:
          return 0;
      }
      
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

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
      showRenewingThisYear: false,
      showTopByCommission: false,
      sortBy: "policy_name",
      sortDirection: "asc"
    });
    setSelectedYear(null);
  };
  
  // Handle year selection from the chart
  const handleYearSelect = (year: number) => {
    setSelectedYear(year === selectedYear ? null : year);
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
      
      {/* KPI Cards Section */}
      {!isLoadingPolicies && policies && (
        <PolicyKPICards policies={filteredPolicies} />
      )}
      
      {/* Commission Projection Chart */}
      {!isLoadingPolicies && policies && (
        <CommissionProjectionChart 
          policies={filteredPolicies}
          years={10} 
        />
      )}
      
      <Card className="mb-6 p-4 mt-6">
        <PolicyFilters 
          filters={filters} 
          setFilters={setFilters}
          clearFilters={clearFilters}
          maxPremium={maxPremium}
          maxFirstYearCommission={maxFirstYearCommission}
        />
        
        {selectedYear && (
          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
            <span className="font-medium">Filtering policies active in year: {selectedYear}</span>
            <button 
              className="ml-2 text-green-600 hover:text-green-800 underline"
              onClick={() => setSelectedYear(null)}
            >
              Clear year filter
            </button>
          </div>
        )}
      </Card>
      
      {isLoadingPolicies ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPolicies && filteredPolicies.length > 0 ? (
        <PoliciesTable 
          policies={filteredPolicies}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDirection}
          onSort={(column) => {
            setFilters(prev => ({
              ...prev,
              sortBy: column,
              sortDirection: prev.sortBy === column && prev.sortDirection === "asc" ? "desc" : "asc"
            }));
          }}
        />
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
