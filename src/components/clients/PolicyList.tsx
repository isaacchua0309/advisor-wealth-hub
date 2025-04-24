
import { Policy } from "@/types/policy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface PolicyListProps {
  policies: Policy[];
}

export function PolicyList({ policies }: PolicyListProps) {
  if (policies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No policies found for this client.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {policies.map((policy) => (
        <Card key={policy.id}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {policy.policy_name}
            </CardTitle>
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
  );
}
