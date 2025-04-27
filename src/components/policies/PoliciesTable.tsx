
import React, { useState } from "react";
import { Policy } from "@/types/policy";
import { 
  Table, 
  TableBody, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PolicyTableHead } from "./PolicyTableHead";
import PolicyTableRow from "./PolicyTableRow";
import PaginationControls from "./PaginationControls";

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
  | "end_date"
  | "days_until_renewal"
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
  
  const handleSort = (column: SortColumn) => {
    if (onSort) {
      onSort(column);
    }
  };
  
  const indexOfLastPolicy = currentPage * policiesPerPage;
  const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
  const currentPolicies = policies.slice(indexOfFirstPolicy, indexOfLastPolicy);
  const totalPages = Math.ceil(policies.length / policiesPerPage);
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <PolicyTableHead 
                column="policy_name"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="sticky left-0 bg-background z-10"
              >
                Policy Name
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="policy_type"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="sticky left-[150px] bg-background z-10"
              >
                Policy Type
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="provider"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
              >
                Provider
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="premium"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
              >
                Premium
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="value"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
              >
                Value
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="first_year_commission"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
              >
                First Year Comm.
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="annual_ongoing_commission"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
              >
                Annual Ongoing Comm.
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="total_expected_commission"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
              >
                Total Expected Comm.
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="premium_to_value_ratio"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
                tooltip="Premium as a percentage of policy value"
              >
                Premium/Value Ratio
              </PolicyTableHead>
              
              <PolicyTableHead className="text-right">Payment Structure</PolicyTableHead>
              
              <PolicyTableHead 
                column="policy_age"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                className="text-right"
              >
                Policy Age
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="start_date"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
              >
                Start Date
              </PolicyTableHead>
              
              <PolicyTableHead 
                column="end_date"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
              >
                End Date
              </PolicyTableHead>
              
              <PolicyTableHead>Next Renewal</PolicyTableHead>
              
              <PolicyTableHead 
                column="days_until_renewal"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
                tooltip="Days remaining until next renewal"
              >
                Days to Renewal
              </PolicyTableHead>
              
              <PolicyTableHead>Commission Maturity</PolicyTableHead>
              
              <PolicyTableHead 
                column="status"
                sortBy={sortBy}
                sortDirection={sortDirection as "asc" | "desc"}
                onSort={handleSort}
              >
                Status
              </PolicyTableHead>
              
              <PolicyTableHead className="text-right">Actions</PolicyTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPolicies.length > 0 ? (
              currentPolicies.map((policy) => (
                <PolicyTableRow key={policy.id} policy={policy} />
              ))
            ) : (
              <TableRow>
                <td colSpan={18} className="h-24 text-center p-4">
                  No policies found.
                </td>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
