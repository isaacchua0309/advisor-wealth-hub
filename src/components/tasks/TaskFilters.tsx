
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface TaskFiltersProps {
  filters: {
    status: string;
    priority: string;
    task_type: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onSearchChange?: (value: string) => void;
}

export function TaskFilters({ filters, onFilterChange, onSearchChange }: TaskFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      
      <Input 
        placeholder="Search tasks..."
        className="w-full"
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
      />
    </div>
  );
}
