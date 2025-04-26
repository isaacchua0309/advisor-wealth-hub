import { useState } from "react";
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
import { GlobalPolicy } from "@/types/globalPolicy";
import { EditGlobalPolicyDialog } from "@/components/global-policies/EditGlobalPolicyDialog";
import { DeleteGlobalPolicyDialog } from "@/components/global-policies/DeleteGlobalPolicyDialog";
import { formatCurrency, formatPercentage, formatDate } from "@/components/policies/PolicyUtils";
import { Edit, Trash } from "lucide-react";

interface GlobalPolicyTableProps {
  policies: GlobalPolicy[];
}

export function GlobalPolicyTable({ policies }: GlobalPolicyTableProps) {
  const [editingPolicy, setEditingPolicy] = useState<GlobalPolicy | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<GlobalPolicy | null>(null);
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Commission Rate</TableHead>
              <TableHead className="text-right">First Year Commission Rate</TableHead>
              <TableHead>Payment Structure</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">{policy.policy_name}</TableCell>
                <TableCell>{policy.policy_type}</TableCell>
                <TableCell>{policy.provider || "—"}</TableCell>
                <TableCell className="text-right">{formatPercentage(policy.commission_rate)}</TableCell>
                <TableCell className="text-right">{formatPercentage(policy.first_year_commission_rate)}</TableCell>
                <TableCell>
                  {policy.payment_structure_type?.replace(/_/g, " ")}
                </TableCell>
                <TableCell>
                  {policy.policy_duration 
                    ? `${policy.policy_duration} years`
                    : policy.payment_structure_type === 'lifetime_premium' 
                      ? "Lifetime" 
                      : "—"}
                </TableCell>
                <TableCell>{formatDate(policy.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingPolicy(policy)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeletingPolicy(policy)}
                        className="text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {editingPolicy && (
        <EditGlobalPolicyDialog
          policy={editingPolicy}
          open={!!editingPolicy}
          onOpenChange={(open) => {
            if (!open) setEditingPolicy(null);
          }}
        />
      )}
      
      {deletingPolicy && (
        <DeleteGlobalPolicyDialog
          policy={deletingPolicy}
          open={!!deletingPolicy}
          onOpenChange={(open) => {
            if (!open) setDeletingPolicy(null);
          }}
        />
      )}
    </>
  );
}
