
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

interface TaskFiltersProps {
  filters: {
    status: string;
    priority: string;
    task_type: string;
    due_date_start?: Date;
    due_date_end?: Date;
    search: string;
  };
  onFilterChange: (key: string, value: any) => void;
  onSearchChange?: (value: string) => void;
}

export function TaskFilters({ filters, onFilterChange, onSearchChange }: TaskFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <Select value={filters.status} onValueChange={(val) => onFilterChange('status', val)}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filters.priority} onValueChange={(val) => onFilterChange('priority', val)}>
        <SelectTrigger>
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filters.task_type} onValueChange={(val) => onFilterChange('task_type', val)}>
        <SelectTrigger>
          <SelectValue placeholder="Task Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="follow-up">Follow-up</SelectItem>
          <SelectItem value="meeting">Meeting</SelectItem>
          <SelectItem value="document">Document</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="call">Call</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(
            "justify-start text-left font-normal",
            !filters.due_date_start && "text-muted-foreground"
          )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.due_date_start ? format(filters.due_date_start, "PPP") : "Start Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.due_date_start}
            onSelect={(date) => onFilterChange('due_date_start', date)}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(
            "justify-start text-left font-normal",
            !filters.due_date_end && "text-muted-foreground"
          )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.due_date_end ? format(filters.due_date_end, "PPP") : "End Date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.due_date_end}
            onSelect={(date) => onFilterChange('due_date_end', date)}
          />
        </PopoverContent>
      </Popover>
      
      <Input 
        placeholder="Search tasks..."
        className="w-full"
        value={filters.search}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
      />
    </div>
  );
}
