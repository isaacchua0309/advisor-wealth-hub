
import { useState } from "react";
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
  Edit, 
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

// Define a type for the column to be sorted
type SortColumn = 
  | "policy_name" 
  | "policy_type" 
  | "provider" 
  | "premium" 
  | "first_year_commission" 
  | "start_date" 
  | "status";

interface PoliciesTableProps {
  policies: Policy[];
}

export default function PoliciesTable({ policies }: PoliciesTableProps) {
  // State for sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>("policy_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 10;
  
  // State for delete dialog
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handle sorting
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Sort policies
  const sortedPolicies = [...policies].sort((a, b) => {
    // Handle null values
    if (a[sortColumn] === null) return sortDirection === "asc" ? -1 : 1;
    if (b[sortColumn] === null) return sortDirection === "asc" ? 1 : -1;
    
    // Handle string comparison
    if (typeof a[sortColumn] === "string" && typeof b[sortColumn] === "string") {
      return sortDirection === "asc" 
        ? (a[sortColumn] as string).localeCompare(b[sortColumn] as string)
        : (b[sortColumn] as string).localeCompare(a[sortColumn] as string);
    }
    
    // Handle number comparison
    if (typeof a[sortColumn] === "number" && typeof b[sortColumn] === "number") {
      return sortDirection === "asc" 
        ? (a[sortColumn] as number) - (b[sortColumn] as number)
        : (b[sortColumn] as number) - (a[sortColumn] as number);
    }
    
    // Handle date comparison
    if (sortColumn === "start_date") {
      const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
      const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    return 0;
  });
  
  // Get paginated policies
  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = sortedPolicies.slice(indexOfFirstPolicy, indexOfLastPolicy);
  const totalPages = Math.ceil(sortedPolicies.length / policiesPerPage);
  
  // Get payment structure label
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
  
  // Get status badge color
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
  
  // Sort indicator component
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                onClick={() => handleSort("policy_name")}
                className="cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center">
                  Policy Name
                  <SortIndicator column="policy_name" />
                </div>
              </TableHead>
              <TableHead 
                onClick={() => handleSort("policy_type")}
                className="cursor-pointer hover:bg-muted/50"
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
                onClick={() => handleSort("first_year_commission")}
                className="cursor-pointer hover:bg-muted/50 text-right"
              >
                <div className="flex items-center justify-end">
                  First Year Commission
                  <SortIndicator column="first_year_commission" />
                </div>
              </TableHead>
              <TableHead>Payment Structure</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead 
                onClick={() => handleSort("start_date")}
                className="cursor-pointer hover:bg-muted/50"
              >
                <div className="flex items-center">
                  Start Date
                  <SortIndicator column="start_date" />
                </div>
              </TableHead>
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
              currentPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.policy_name}</TableCell>
                  <TableCell>{policy.policy_type}</TableCell>
                  <TableCell>{policy.provider || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    {policy.premium ? `$${policy.premium.toLocaleString()}` : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {policy.first_year_commission 
                      ? `$${policy.first_year_commission.toLocaleString()}` 
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {getPaymentStructureLabel(policy.payment_structure_type)}
                  </TableCell>
                  <TableCell>
                    {policy.policy_duration ? `${policy.policy_duration} years` : "N/A"}
                  </TableCell>
                  <TableCell>
                    {policy.start_date 
                      ? format(new Date(policy.start_date), "MMM d, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(policy.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No policies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
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
                // Show first, last, and pages around current page
                return (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                );
              })
              .map((page, index, array) => {
                // Add ellipsis where needed
                const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                
                return (
                  <span key={page}>
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
                  </span>
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
      
      {/* Delete Policy Dialog */}
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
