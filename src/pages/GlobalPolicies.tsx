
import { useState, useMemo } from "react";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusCircle, Pencil, Trash, FileText, Filter, CheckSquare } from "lucide-react";
import GlobalPolicyDialog from "@/components/global-policies/GlobalPolicyDialog";
import DeleteGlobalPolicyDialog from "@/components/global-policies/DeleteGlobalPolicyDialog";
import { GlobalPolicy } from "@/types/policy";
import { GlobalPolicyKpiCards } from "@/components/global-policies/GlobalPolicyKpiCards";
import { GlobalPolicyFilters } from "@/components/global-policies/GlobalPolicyFilters";
import { format } from "date-fns";

export default function GlobalPolicies() {
  const { globalPolicies, isLoadingGlobalPolicies, deleteGlobalPolicy } = useGlobalPolicies();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<GlobalPolicy | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    provider: "",
    policyType: "",
    status: "",
    minCommissionRate: 0,
    maxCommissionRate: 100,
    minPolicyDuration: 0,
    maxPolicyDuration: 50
  });

  // Apply filters to policies
  const filteredPolicies = useMemo(() => {
    if (!globalPolicies) return [];
    
    return globalPolicies.filter(policy => {
      // Filter by provider
      if (filters.provider && policy.provider?.toLowerCase() !== filters.provider.toLowerCase() && filters.provider !== "all") {
        return false;
      }
      
      // Filter by policy type
      if (filters.policyType && policy.policy_type.toLowerCase() !== filters.policyType.toLowerCase() && filters.policyType !== "all") {
        return false;
      }
      
      // Filter by status
      if (filters.status && policy.status?.toLowerCase() !== filters.status.toLowerCase() && filters.status !== "all") {
        return false;
      }
      
      // Filter by first year commission rate
      if (policy.first_year_commission_rate !== null) {
        if (policy.first_year_commission_rate < filters.minCommissionRate || 
            policy.first_year_commission_rate > filters.maxCommissionRate) {
          return false;
        }
      }
      
      // Filter by policy duration
      if (policy.policy_duration !== null) {
        if (policy.policy_duration < filters.minPolicyDuration ||
            policy.policy_duration > filters.maxPolicyDuration) {
          return false;
        }
      }
      
      return true;
    });
  }, [globalPolicies, filters]);

  const handleEditPolicy = (policy: GlobalPolicy) => {
    setSelectedPolicy(policy);
    setIsEditDialogOpen(true);
  };

  const handleDeletePolicy = (policy: GlobalPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteDialogOpen(true);
  };

  const togglePolicySelection = (policyId: string) => {
    if (selectedPolicies.includes(policyId)) {
      setSelectedPolicies(selectedPolicies.filter(id => id !== policyId));
    } else {
      setSelectedPolicies([...selectedPolicies, policyId]);
    }
  };

  const toggleAllPolicies = () => {
    if (!filteredPolicies) return;
    
    if (selectedPolicies.length === filteredPolicies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(filteredPolicies.map(policy => policy.id));
    }
  };

  const bulkActivatePolicies = () => {
    // In a real implementation, this would update the policies' status to "Active"
    console.log("Bulk activate policies:", selectedPolicies);
    // Reset selection after bulk action
    setSelectedPolicies([]);
  };

  const bulkDeactivatePolicies = () => {
    // In a real implementation, this would update the policies' status to "Inactive"
    console.log("Bulk deactivate policies:", selectedPolicies);
    // Reset selection after bulk action
    setSelectedPolicies([]);
  };

  // Calculate KPI metrics for cards
  const kpiMetrics = useMemo(() => {
    if (!globalPolicies || globalPolicies.length === 0) {
      return {
        totalActivePolicies: 0,
        avgFirstYearCommission: 0,
        topProvider: "N/A",
        avgPolicyDuration: 0
      };
    }

    // Count active policies
    const activePolicies = globalPolicies.filter(policy => policy.status === "Active").length;
    
    // Calculate average first-year commission rate
    const validCommissionRates = globalPolicies
      .filter(policy => policy.first_year_commission_rate !== null)
      .map(policy => policy.first_year_commission_rate as number);
    
    const avgFirstYearCommission = validCommissionRates.length > 0
      ? validCommissionRates.reduce((sum, rate) => sum + rate, 0) / validCommissionRates.length
      : 0;
    
    // Find top provider
    const providerCounts: Record<string, number> = {};
    globalPolicies.forEach(policy => {
      const provider = policy.provider || "Unknown";
      providerCounts[provider] = (providerCounts[provider] || 0) + 1;
    });
    
    const topProvider = Object.entries(providerCounts).length > 0
      ? Object.entries(providerCounts).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";
    
    // Calculate average policy duration
    const validDurations = globalPolicies
      .filter(policy => policy.policy_duration !== null)
      .map(policy => policy.policy_duration as number);
    
    const avgPolicyDuration = validDurations.length > 0
      ? validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length
      : 0;
    
    return {
      totalActivePolicies: activePolicies,
      avgFirstYearCommission: Math.round(avgFirstYearCommission * 10) / 10, // Round to 1 decimal
      topProvider,
      avgPolicyDuration: Math.round(avgPolicyDuration * 10) / 10 // Round to 1 decimal
    };
  }, [globalPolicies]);

  // Get unique providers and policy types for filters
  const uniqueProviders = useMemo(() => {
    if (!globalPolicies) return [];
    const providers = globalPolicies
      .map(policy => policy.provider)
      .filter((provider, index, self) => 
        provider !== null && self.indexOf(provider) === index
      ) as string[];
    return providers;
  }, [globalPolicies]);

  const uniquePolicyTypes = useMemo(() => {
    if (!globalPolicies) return [];
    const types = globalPolicies
      .map(policy => policy.policy_type)
      .filter((type, index, self) => self.indexOf(type) === index);
    return types;
  }, [globalPolicies]);

  return (
    <div className="w-full mx-auto max-w-[1600px]">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Global Policies</h2>
            <p className="text-muted-foreground mt-1">
              Create and manage global policy templates for your clients.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedPolicies.length > 0 && (
              <>
                <Button onClick={bulkActivatePolicies} variant="outline" size="sm">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Bulk Activate
                </Button>
                <Button onClick={bulkDeactivatePolicies} variant="outline" size="sm" 
                  className="text-destructive hover:text-destructive/80">
                  <Trash className="mr-2 h-4 w-4" />
                  Bulk Deactivate
                </Button>
              </>
            )}
            <Button onClick={() => setIsAddDialogOpen(true)} className="px-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Global Policy
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <GlobalPolicyKpiCards
          totalActivePolicies={kpiMetrics.totalActivePolicies}
          avgFirstYearCommission={kpiMetrics.avgFirstYearCommission}
          topProvider={kpiMetrics.topProvider}
          avgPolicyDuration={kpiMetrics.avgPolicyDuration}
        />

        {/* Filters */}
        <GlobalPolicyFilters
          providers={uniqueProviders}
          policyTypes={uniquePolicyTypes}
          filters={filters}
          setFilters={setFilters}
        />

        {/* Global Policies Table */}
        <Card className="w-full overflow-hidden border shadow-sm">
          {isLoadingGlobalPolicies ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPolicies && filteredPolicies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/60">
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
                        onCheckedChange={toggleAllPolicies}
                      />
                    </TableHead>
                    <TableHead className="font-medium">Policy Name</TableHead>
                    <TableHead className="font-medium">Provider</TableHead>
                    <TableHead className="font-medium">Type</TableHead>
                    <TableHead className="font-medium">Payment Structure</TableHead>
                    <TableHead className="text-right font-medium">First Year Commission</TableHead>
                    <TableHead className="text-right font-medium">Ongoing Commission</TableHead>
                    <TableHead className="text-right font-medium">Commission Duration</TableHead>
                    <TableHead className="text-right font-medium">Policy Duration</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium">Last Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="w-[40px]">
                        <Checkbox 
                          checked={selectedPolicies.includes(policy.id)}
                          onCheckedChange={() => togglePolicySelection(policy.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{policy.policy_name}</TableCell>
                      <TableCell>{policy.provider || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {policy.policy_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.payment_structure_type ? (
                          <span className="capitalize">
                            {policy.payment_structure_type.replace(/_/g, ' ')}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {policy.first_year_commission_rate ? `${policy.first_year_commission_rate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {policy.ongoing_commission_rate ? `${policy.ongoing_commission_rate}%` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {policy.commission_duration ? `${policy.commission_duration} years` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {policy.policy_duration ? `${policy.policy_duration} years` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={policy.status === "Active" ? "default" : "outline"}>
                          {policy.status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {policy.updated_at ? format(new Date(policy.updated_at), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPolicy(policy)}
                            className="hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => handleDeletePolicy(policy)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No global policies found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create global policy templates to quickly apply standardized policies to your clients.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="px-6">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Your First Global Policy
              </Button>
            </div>
          )}
        </Card>
      </div>

      <GlobalPolicyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        mode="create"
      />

      {selectedPolicy && (
        <>
          <GlobalPolicyDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            mode="edit"
            policy={selectedPolicy}
          />
          <DeleteGlobalPolicyDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            policy={selectedPolicy}
          />
        </>
      )}
    </div>
  );
}
