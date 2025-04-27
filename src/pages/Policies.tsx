
import { useState, useEffect } from "react";
import { useClients } from "@/hooks/useClients";
import { Policy } from "@/types/policy";
import { Card } from "@/components/ui/card";
import PolicyFilters from "@/components/policies/PolicyFilters";
import PolicyKPICards from "@/components/policies/PolicyKPICards";
import CommissionProjectionChart from "@/components/policies/CommissionProjectionChart";
import { calculateTotalExpectedCommission } from "@/components/policies/PolicyUtils";
import YearFilter from "@/components/policies/YearFilter";
import PolicyListContainer from "@/components/policies/PolicyListContainer";

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
  const { policies, isLoadingPolicies } = useClients();
  
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
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

  const [maxPremium, setMaxPremium] = useState(1000000);
  const [maxFirstYearCommission, setMaxFirstYearCommission] = useState(100000);

  // Update max ranges based on actual policy data
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

  // Filter policies based on user selection
  useEffect(() => {
    if (!policies) {
      setFilteredPolicies([]);
      return;
    }

    const typedPolicies = policies as Policy[];

    let filtered = typedPolicies.filter(policy => {
      const searchMatch = !filters.search || 
        policy.policy_name.toLowerCase().includes(filters.search.toLowerCase());
      
      const typeMatch = filters.policyType === "all" || 
        policy.policy_type === filters.policyType;
      
      const paymentStructureMatch = filters.paymentStructure === "all" || 
        policy.payment_structure_type === filters.paymentStructure;
      
      const statusMatch = filters.status === "all" || 
        policy.status === filters.status;
      
      const durationMatch = !policy.policy_duration || 
        (policy.policy_duration >= filters.policyDuration[0] && 
         policy.policy_duration <= filters.policyDuration[1]);
      
      const premiumMatch = !policy.premium || 
        (policy.premium >= filters.premiumRange[0] && 
         policy.premium <= filters.premiumRange[1]);
      
      const commissionMatch = !policy.commission_rate || 
        (policy.commission_rate >= filters.commissionRange[0] && 
         policy.commission_rate <= filters.commissionRange[1]);
      
      const firstYearCommissionMatch = !policy.first_year_commission || 
        (policy.first_year_commission >= filters.firstYearCommissionRange[0] && 
         policy.first_year_commission <= filters.firstYearCommissionRange[1]);
      
      const renewingThisYearMatch = !filters.showRenewingThisYear || isRenewingThisYear(policy);
      
      const yearMatch = selectedYear === null || isPolicyActiveInYear(policy, selectedYear);
      
      return searchMatch && typeMatch && paymentStructureMatch && statusMatch && 
        durationMatch && premiumMatch && commissionMatch && firstYearCommissionMatch &&
        renewingThisYearMatch && yearMatch;
    });
    
    filtered = sortPolicies(filtered, filters.sortBy, filters.sortDirection);
    
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

  // Helper functions for filtering
  const isRenewingThisYear = (policy: Policy): boolean => {
    if (!policy.start_date) return false;
    
    const startDate = new Date(policy.start_date);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const renewalDate = new Date(startDate);
    renewalDate.setFullYear(currentYear);
    
    if (renewalDate < currentDate) {
      renewalDate.setFullYear(currentYear + 1);
    }
    
    return renewalDate.getFullYear() === currentYear;
  };
  
  const isPolicyActiveInYear = (policy: Policy, year: number): boolean => {
    if (!policy.start_date) return false;
    
    const startDate = new Date(policy.start_date);
    const startYear = startDate.getFullYear();
    
    if (policy.end_date) {
      const endDate = new Date(policy.end_date);
      const endYear = endDate.getFullYear();
      return year >= startYear && year <= endYear;
    }
    
    if (policy.commission_duration) {
      const endYear = startYear + policy.commission_duration;
      return year >= startYear && year <= endYear;
    }
    
    return year >= startYear;
  };
  
  // Sort policies based on selected column and direction
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

  const handleYearSelect = (year: number) => {
    setSelectedYear(year === selectedYear ? null : year);
  };

  const handleClearYear = () => {
    setSelectedYear(null);
  };

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortDirection: prev.sortBy === column && prev.sortDirection === "asc" ? "desc" : "asc"
    }));
  };

  return (
    <div className="w-full max-w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Policies</h2>
          <p className="text-muted-foreground">
            View and manage all your client policies.
          </p>
        </div>
      </div>
      
      <div className="mb-10">
        {!isLoadingPolicies && policies && (
          <PolicyKPICards policies={filteredPolicies} />
        )}
      </div>
      
      <div className="mb-10">
        {!isLoadingPolicies && policies && (
          <CommissionProjectionChart 
            policies={filteredPolicies}
            years={10}
            onYearSelect={handleYearSelect}
            selectedYear={selectedYear}
          />
        )}
      </div>
      
      <Card className="mb-10 p-6 bg-slate-50/50 border-slate-100">
        <PolicyFilters 
          filters={filters} 
          setFilters={setFilters}
          clearFilters={clearFilters}
          maxPremium={maxPremium}
          maxFirstYearCommission={maxFirstYearCommission}
        />
        
        <YearFilter 
          selectedYear={selectedYear} 
          onClearYear={handleClearYear} 
        />
      </Card>
      
      <div className="w-full max-w-full mb-10">
        <PolicyListContainer 
          isLoadingPolicies={isLoadingPolicies}
          policies={policies}
          filteredPolicies={filteredPolicies}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDirection}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
