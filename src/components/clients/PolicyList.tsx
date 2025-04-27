
import { useState } from "react";
import { Policy } from "@/types/policy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import EditPolicyDialog from "./EditPolicyDialog"; // Change to default import
import { DeletePolicyDialog } from "./DeletePolicyDialog";
import { AddPolicyDialog } from "./AddPolicyDialog";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

interface PolicyListProps {
  policies: Policy[];
  clientId: string;
}

export function PolicyList({ policies, clientId }: PolicyListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState<Policy | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);
  const { addPolicy } = useClients();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-primary">Policies</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Policy
        </Button>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-12 px-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">
              This client doesn't have any policies yet. Click "Add New Policy" to get started.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              variant="outline" 
              className="mx-auto"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add your first policy
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <Card 
              key={policy.id} 
              className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20 card-hover"
            >
              <CardHeader className={cn(
                "pb-2 border-b", 
                policy.status === "active" ? "bg-green-50 dark:bg-green-950/20" :
                policy.status === "pending" ? "bg-amber-50 dark:bg-amber-950/20" :
                policy.status === "expired" ? "bg-gray-50 dark:bg-gray-900/20" :
                policy.status === "cancelled" ? "bg-red-50 dark:bg-red-950/20" : ""
              )}>
                <div className="flex justify-between">
                  <CardTitle className="text-base font-semibold truncate">
                    {policy.policy_name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setPolicyToEdit(policy)}
                      className="h-8 w-8 hover:bg-background/80"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit policy</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setPolicyToDelete(policy)}
                      className="h-8 w-8 hover:bg-background/80 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete policy</span>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground capitalize">
                    {policy.policy_type.replace('-', ' ')}
                  </p>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    policy.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                    policy.status === "pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                    policy.status === "expired" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" :
                    policy.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : ""
                  )}>
                    {policy.status ? policy.status.charAt(0).toUpperCase() + policy.status.slice(1) : "N/A"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 pb-3">
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Provider</p>
                    <p className="truncate">{policy.provider || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Policy Number</p>
                    <p className="truncate">{policy.policy_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Premium</p>
                    <p className="font-medium">{policy.premium ? `$${policy.premium.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Value</p>
                    <p>{policy.value ? `$${policy.value.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Start Date</p>
                    <p>{policy.start_date ? format(new Date(policy.start_date), 'PP') : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">End Date</p>
                    <p>{policy.end_date ? format(new Date(policy.end_date), 'PP') : "N/A"}</p>
                  </div>

                  <div className="col-span-2 pt-2 mt-1 border-t">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Payment Structure</p>
                    <p className="text-sm">
                      {policy.payment_structure_type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Commission Rate</p>
                    <p>{policy.commission_rate ? `${policy.commission_rate}%` : 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-medium">First Year Commission</p>
                    <p className="font-medium text-primary">
                      {policy.first_year_commission ? 
                        `$${policy.first_year_commission.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Annual Ongoing</p>
                    <p>{policy.annual_ongoing_commission ? 
                      `$${policy.annual_ongoing_commission.toLocaleString()}` : 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Policy Duration</p>
                    <p>{policy.policy_duration ? 
                      `${policy.policy_duration} years` : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPolicyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        clientId={clientId}
      />

      {policyToEdit && (
        <EditPolicyDialog
          policy={policyToEdit}
          open={!!policyToEdit}
          onOpenChange={() => setPolicyToEdit(null)}
        />
      )}

      {policyToDelete && (
        <DeletePolicyDialog
          policy={policyToDelete}
          open={!!policyToDelete}
          onOpenChange={() => setPolicyToDelete(null)}
        />
      )}
    </div>
  );
}
