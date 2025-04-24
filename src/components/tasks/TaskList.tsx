
import React from 'react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";

interface TaskListProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'overdue') => void;
}

export function TaskList({ tasks, isLoading, onStatusChange }: TaskListProps) {
  const getPriorityBadge = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-600">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Status</TableHead>
          <TableHead>Task Description</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Task Type</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks?.map((task) => (
          <TableRow key={task.id}>
            <TableCell>
              <Checkbox 
                checked={task.status === 'completed'}
                onCheckedChange={() => 
                  onStatusChange(
                    task.id!, 
                    task.status === 'completed' ? 'pending' : 'completed'
                  )
                }
              />
            </TableCell>
            <TableCell className={cn(task.status === 'completed' && "line-through text-muted-foreground")}>
              {task.title}
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}
            </TableCell>
            <TableCell>{task.client_id || 'No Client'}</TableCell>
            <TableCell>
              {task.due_date ? format(new Date(task.due_date), 'PP') : 'No date'}
            </TableCell>
            <TableCell>
              {getPriorityBadge(task.priority)}
            </TableCell>
            <TableCell>{task.task_type || 'Follow-up'}</TableCell>
          </TableRow>
        ))}
        
        {(!tasks || tasks.length === 0) && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              {isLoading ? 'Loading tasks...' : 'No tasks found. Create a new task to get started.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
