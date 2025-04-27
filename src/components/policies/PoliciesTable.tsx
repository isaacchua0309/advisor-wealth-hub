import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Policy } from "@/types/policy";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDown, 
  ArrowUp, 
  ChevronDown, 
  ExternalLink, 
  Trash
} from "lucide-react";
import { DeletePolicyDialog } from "@/components/clients/DeletePolicyDialog";
import { format } from "date-fns";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  formatCurrency, 
  formatPercentage, 
  calculateTotalExpectedCommission, 
  calculatePremiumToValueRatio,
  calculatePolicyAge,
  calculateCommissionMaturityDate,
  calculateNextRenewalDate,
  formatReadableDate
} from "./PolicyUtils";

type SortColumn = 
  | "policy_name" 
  | "policy_type" 
  | "provider" 
  | "premium" 
  | "value"
  | "first_year_commission" 
  | "annual_ongoing_commission"
  | "total_expected_commission"
  | "premium_to_value_ratio"
  | "policy_age"
  | "start_date" 
  | "status";

interface PoliciesTableProps {
  policies: Policy[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: SortColumn) => void;
}

export default function PoliciesTable({ 
  policies,
  sortBy = "policy_name",
  sortDirection = "asc",
  onSort
}: PoliciesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 10;
  
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSort = (column: SortColumn) => {
    if (onSort) {
      onSort(column);
    }
  };
  
  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = policies.slice(indexOfFirstPolicy, indexOfLastPolicy);
  const totalPages = Math.ceil(policies.length / policiesPerPage);
  
  const getPaymentStructureLabel = (type: Policy["payment_structure_type"]) => {
    const structures = {
      single_premium: "Single Premium",
      one_year_term: "One-Year Term",
      regular_premium: "Regular Premium",
      five_year_premium: "5-Year Premium",
      ten_year_premium: "10-Year Premium",
      lifetime_premium: "Lifetime Premium"
    };
    
    return structures[type] || type;
  };
  
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { variant: "default" },
      inactive: { variant: "secondary" },
      expired: { variant: "outline" },
      cancelled: { variant: "destructive" },
      pending: { variant: "outline" }
    };
    
    const statusConfig = statusMap[status.toLowerCase()] || { variant: "outline" };
    
    return (
      <Badge variant={statusConfig.variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                onClick={() => handleSort("policy_name")}
                className="cursor-pointer hover:bg-muted/50 sticky left-0 bg-background z-10"
              >
                <div className="flex items-center">
                  Policy Name
                  <SortIndicator column="policy_name" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("policy_type")}
                className="cursor-pointer hover:bg-muted/50 sticky left-[150px] bg-background z-10"
              >
                <div className="flex items-center">
                  Policy Type
                  <SortIndicator column="policy_type" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("provider")}
                className="cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center">
                  Provider
                  <SortIndicator column="provider" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("premium")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  Premium
                  <SortIndicator column="premium" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("value")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  Value
                  <SortIndicator column="value" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("first_year_commission")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  First Year Comm.
                  <SortIndicator column="first_year_commission" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("annual_ongoing_commission")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  Annual Ongoing Comm.
                  <SortIndicator column="annual_ongoing_commission" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("total_expected_commission")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  Total Expected Comm.
                  <SortIndicator column="total_expected_commission" />
                </div>
              </TableHead>
              
              <TableHead className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-end cursor-pointer hover:bg-muted/50"
                           onClick={() => handleSort("premium_to_value_ratio")}>
                        Premium/Value Ratio
                        <SortIndicator column="premium_to_value_ratio" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Premium as a percentage of policy value</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              
              <TableHead className="text-right">Payment Structure</TableHead>
              
              <TableHead 
                onClick={() => handleSort("policy_age")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  Policy Age
                  <SortIndicator column="policy_age" />
                </div>
              </TableHead>
              
              <TableHead 
                onClick={() => handleSort("start_date")}
                className="cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center">
                  Start Date
                  <SortIndicator column="start_date" />
                </div>
              </TableHead>
              
              <TableHead>Next Renewal</TableHead>
              
              <TableHead>Commission Maturity</TableHead>
              
              <TableHead 
                onClick={() => handleSort("status")}
                className="cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center">
                  Status
                  <SortIndicator column="status" />
                </div>
              </TableHead>
              
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPolicies.length > 0 ? (
              currentPolicies.map((policy) => {
                const totalExpectedCommission = calculateTotalExpectedCommission(policy);
                const premiumToValueRatio = calculatePremiumToValueRatio(policy);
                const policyAge = calculatePolicyAge(policy);
                const commissionMaturityDate = calculateCommissionMaturityDate(policy);
                const nextRenewalDate = calculateNextRenewalDate(policy);
                
                return (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                      {policy.policy_name}
                    </TableCell>
                    <TableCell className="sticky left-[150px] bg-background z-10">{policy.policy_type}</TableCell>
                    <TableCell>{policy.provider || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(policy.premium)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(policy.value)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(policy.first_year_commission)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(policy.annual_ongoing_commission)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(totalExpectedCommission)}
                    </TableCell>
                    <TableCell className="text-right">
                      {premiumToValueRatio !== null ? formatPercentage(premiumToValueRatio) : "—"}
                    </TableCell>
                    <TableCell>
                      {getPaymentStructureLabel(policy.payment_structure_type)}
                    </TableCell>
                    <TableCell className="text-right">
                      {policyAge !== null ? `${policyAge} years` : "—"}
                    </TableCell>
                    <TableCell>
                      {policy.start_date 
                        ? format(new Date(policy.start_date), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {formatReadableDate(nextRenewalDate)}
                    </TableCell>
                    <TableCell>
                      {formatReadableDate(commissionMaturityDate)}
                    </TableCell>
                    <TableCell>{getStatusBadge(policy.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <span className="sr-only">Open menu</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/clients/${policy.client_id}`} className="flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Client
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPolicyToDelete(policy);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Policy
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={16} className="h-24 text-center">
                  No policies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                return (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, index, array) => {
                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <PaginationItem>
                        <span className="flex h-9 w-9 items-center justify-center">...</span>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                    
                    {showEllipsisAfter && (
                      <PaginationItem>
                        <span className="flex h-9 w-9 items-center justify-center">...</span>
                      </PaginationItem>
                    )}
                  </React.Fragment>
                );
              })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      {policyToDelete && (
        <DeletePolicyDialog
          policy={policyToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </div>
  );
}
