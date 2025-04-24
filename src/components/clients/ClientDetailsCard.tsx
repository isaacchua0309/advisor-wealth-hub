
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/types/client";

export function ClientDetailsCard({ 
  client, 
  onPipelineStageChange 
}: { 
  client: Client; 
  onPipelineStageChange?: (stage: Client['pipeline_stage']) => void 
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-semibold">{client.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Pipeline Stage:</span>
            <Select 
              value={client.pipeline_stage} 
              onValueChange={onPipelineStageChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                <SelectItem value="Negotiation">Negotiation</SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
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
