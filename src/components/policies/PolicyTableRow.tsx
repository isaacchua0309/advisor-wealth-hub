
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Policy } from "@/types/policy";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ExternalLink, Trash } from "lucide-react";
import { DeletePolicyDialog } from "@/components/clients/DeletePolicyDialog";
import { format } from "date-fns";
import { 
  formatCurrency, 
  formatPercentage, 
  calculateTotalExpectedCommission, 
  calculatePremiumToValueRatio,
  calculatePolicyAge,
  calculateCommissionMaturityDate,
  calculateNextRenewalDate,
  formatReadableDate,
  calculateDaysUntilRenewal
} from "./PolicyUtils";

interface PolicyTableRowProps {
  policy: Policy;
}

export default function PolicyTableRow({ policy }: PolicyTableRowProps) {
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const totalExpectedCommission = calculateTotalExpectedCommission(policy);
  const premiumToValueRatio = calculatePremiumToValueRatio(policy);
  const policyAge = calculatePolicyAge(policy);
  const commissionMaturityDate = calculateCommissionMaturityDate(policy);
  const nextRenewalDate = calculateNextRenewalDate(policy);
  const daysUntilRenewal = calculateDaysUntilRenewal(policy);
  
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

  const getRenewalUrgencyStyle = () => {
    if (daysUntilRenewal === null) return {};
    
    if (daysUntilRenewal <= 30) {
      return { color: "rgb(220, 38, 38)" }; // Red for urgent
    } else if (daysUntilRenewal <= 60) {
      return { color: "rgb(245, 158, 11)" }; // Amber for soon
    } else {
      return {}; // Default
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium sticky left-0 bg-background z-10">
          <Link to={`/clients/${policy.client_id}`} className="text-blue-600 hover:text-blue-800 hover:underline">
            {policy.policy_name}
          </Link>
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
          {policy.end_date 
            ? format(new Date(policy.end_date), "MMM d, yyyy")
            : "—"}
        </TableCell>
        <TableCell style={getRenewalUrgencyStyle()}>
          {formatReadableDate(nextRenewalDate)}
        </TableCell>
        <TableCell style={getRenewalUrgencyStyle()}>
          {daysUntilRenewal !== null ? `${daysUntilRenewal} days` : "—"}
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

      {policyToDelete && (
        <DeletePolicyDialog
          policy={policyToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        />
      )}
    </>
  );
}
