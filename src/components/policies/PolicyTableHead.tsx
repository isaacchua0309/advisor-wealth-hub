
import React from "react";
import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SortIndicatorProps {
  column: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export const SortIndicator = ({ column, sortBy, sortDirection }: SortIndicatorProps) => {
  if (sortBy !== column) return null;
  
  return sortDirection === "asc" ? (
    <ArrowUp className="ml-1 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-1 h-4 w-4" />
  );
};

interface PolicyTableHeadProps {
  children: React.ReactNode;
  column?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  className?: string;
  tooltip?: string;
}

export function PolicyTableHead({ 
  children, 
  column, 
  sortBy, 
  sortDirection, 
  onSort,
  className = "",
  tooltip
}: PolicyTableHeadProps) {
  const handleClick = () => {
    if (column && onSort) {
      onSort(column);
    }
  };

  const content = (
    <div className={`flex items-center ${column && onSort ? 'cursor-pointer hover:bg-muted/50' : ''} ${className}`}
         onClick={handleClick}>
      {children}
      {column && sortBy && sortDirection && (
        <SortIndicator column={column} sortBy={sortBy} sortDirection={sortDirection} />
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TableHead className={className}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableHead>
    );
  }

  return (
    <TableHead className={className}>
      {content}
    </TableHead>
  );
}
