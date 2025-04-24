
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Client } from "@/types/client";

interface PipelineStageIndicatorProps {
  stage: Client["pipeline_stage"];
  onStageChange?: (stage: Client["pipeline_stage"]) => void;
  clientId: string;
  isEditable?: boolean;
  size?: "sm" | "md" | "lg";
}

// Tooltip descriptions for each pipeline stage
const stageTips = {
  Lead: "Initial prospect, not yet contacted",
  Contacted: "Client has been reached out to",
  "Proposal Sent": "Insurance proposal has been sent to client",
  Negotiation: "Actively discussing terms with client",
  "Closed Won": "Client has signed and policies are active",
  "Closed Lost": "Client declined to proceed",
};

export function PipelineStageIndicator({
  stage,
  onStageChange,
  clientId,
  isEditable = false,
  size = "md",
}: PipelineStageIndicatorProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Get badge variant based on pipeline stage
  const getBadgeVariant = (stage: Client["pipeline_stage"]) => {
    switch (stage) {
      case "Lead":
        return "secondary";
      case "Contacted":
        return "outline";
      case "Proposal Sent":
        return "default";
      case "Negotiation":
        return "secondary";
      case "Closed Won":
        return "default";
      case "Closed Lost":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleStageChange = (newStage: Client["pipeline_stage"]) => {
    if (onStageChange) {
      onStageChange(newStage);
    }
    setIsEditing(false);
  };

  const badgeSizeClass = size === "sm" ? "text-xs py-0" : size === "lg" ? "text-sm py-1 px-3" : "";

  if (!isEditable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getBadgeVariant(stage)} className={badgeSizeClass}>
              {stage}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{stageTips[stage] || "Current pipeline stage"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return isEditing ? (
    <div onBlur={() => setIsEditing(false)}>
      <Select
        defaultValue={stage}
        onValueChange={(value) => handleStageChange(value as Client["pipeline_stage"])}
        autoFocus
      >
        <SelectTrigger className="w-36 h-8">
          <SelectValue placeholder={stage} />
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
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getBadgeVariant(stage)}
            className={`cursor-pointer ${badgeSizeClass}`}
            onClick={() => setIsEditing(true)}
          >
            {stage}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to change stage</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
