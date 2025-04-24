
import { useState } from "react";
import { Policy } from "@/types/policy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { EditPolicyDialog } from "./EditPolicyDialog";
import { DeletePolicyDialog } from "./DeletePolicyDialog";
import { AddPolicyDialog } from "./AddPolicyDialog";
import { useClients } from "@/hooks/useClients";

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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Policies</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add New Policy
        </Button>
      </div>

      {policies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No policies found for this client.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {policy.policy_name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setPolicyToEdit(policy)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit policy</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setPolicyToDelete(policy)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete policy</span>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type: {policy.policy_type}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Provider</p>
                    <p>{policy.provider || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Policy Number</p>
                    <p>{policy.policy_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Premium</p>
                    <p>{policy.premium ? `$${policy.premium.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p>{policy.value ? `$${policy.value.toLocaleString()}` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p>{policy.start_date ? format(new Date(policy.start_date), 'PP') : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p>{policy.end_date ? format(new Date(policy.end_date), 'PP') : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p>{policy.status || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Policy Dialog */}
      <AddPolicyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        clientId={clientId}
      />

      {/* Edit Policy Dialog */}
      {policyToEdit && (
        <EditPolicyDialog
          policy={policyToEdit}
          open={!!policyToEdit}
          onOpenChange={() => setPolicyToEdit(null)}
        />
      )}

      {/* Delete Policy Dialog */}
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
