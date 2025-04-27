
import { Card } from "@/components/ui/card";

interface PipelineKpiCardsProps {
  openDeals: number;
  pipelineValue: number;
  averageDealSize: number;
  winRate: number;
}

export function PipelineKpiCards({
  openDeals,
  pipelineValue,
  averageDealSize,
  winRate
}: PipelineKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Open Deals</span>
          <span className="text-2xl font-bold mt-1">{openDeals}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Pipeline Value</span>
          <span className="text-2xl font-bold mt-1">${pipelineValue.toLocaleString()}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Average Deal Size</span>
          <span className="text-2xl font-bold mt-1">${averageDealSize.toLocaleString()}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Win Rate</span>
          <span className="text-2xl font-bold mt-1">{winRate}%</span>
        </div>
      </Card>
    </div>
  );
}
