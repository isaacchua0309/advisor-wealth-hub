
import { useState } from "react";
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
import { Loader2, PlusCircle, Pencil, Trash } from "lucide-react";
import GlobalPolicyDialog from "@/components/global-policies/GlobalPolicyDialog";
import DeleteGlobalPolicyDialog from "@/components/global-policies/DeleteGlobalPolicyDialog";
import { GlobalPolicy } from "@/types/policy";

export default function GlobalPolicies() {
  const { globalPolicies, isLoadingGlobalPolicies } = useGlobalPolicies();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<GlobalPolicy | null>(null);

  const handleEditPolicy = (policy: GlobalPolicy) => {
    setSelectedPolicy(policy);
    setIsEditDialogOpen(true);
  };

  const handleDeletePolicy = (policy: GlobalPolicy) => {
    setSelectedPolicy(policy);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Global Policies</h2>
          <p className="text-muted-foreground">
            Create and manage global policy templates for your clients.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Global Policy
        </Button>
      </div>

      <Card>
        {isLoadingGlobalPolicies ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : globalPolicies && globalPolicies.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">First Year Commission</TableHead>
                  <TableHead className="text-right">Ongoing Commission</TableHead>
                  <TableHead className="text-right">Commission Duration</TableHead>
                  <TableHead className="text-right">Policy Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {globalPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.policy_name}</TableCell>
                    <TableCell>{policy.provider || "-"}</TableCell>
                    <TableCell>{policy.policy_type}</TableCell>
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
                        {policy.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
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
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No global policies found.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              Add Your First Global Policy
            </Button>
          </div>
        )}
      </Card>

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
