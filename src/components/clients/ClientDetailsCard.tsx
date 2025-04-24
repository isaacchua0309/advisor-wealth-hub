
import { Client } from "@/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ClientDetailsCardProps {
  client: Client;
}

export function ClientDetailsCard({ client }: ClientDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{client.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-medium">Contact Information</h3>
            <div className="grid gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p>{client.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{client.phone || "Not provided"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Additional Details</h3>
            <div className="grid gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Occupation</p>
                <p>{client.occupation || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Age Group</p>
                <p>{client.age_group || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
