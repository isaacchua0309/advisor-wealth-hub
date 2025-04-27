
import React from 'react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { Link } from "react-router-dom";

interface TaskListProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'overdue') => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
}

export function TaskList({ tasks, isLoading, onStatusChange, selectedTasks, onSelectTask }: TaskListProps) {
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

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600">Completed</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-600">Overdue</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Pending</Badge>;
    }
  };

  const sortedTasks = tasks?.slice().sort((a, b) => {
    // Sort overdue tasks to the top
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    
    // Then sort by due date
    return new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime();
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Task Description</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Task Type</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTasks?.map((task) => (
          <TableRow 
            key={task.id} 
            className={cn(
              task.status === 'overdue' && "bg-red-50/50",
              selectedTasks.includes(task.id!) && "bg-muted/50"
            )}
          >
            <TableCell>
              <Checkbox 
                checked={selectedTasks.includes(task.id!)}
                onCheckedChange={() => onSelectTask(task.id!)}
              />
            </TableCell>
            <TableCell>{getStatusBadge(task.status)}</TableCell>
            <TableCell className={cn(task.status === 'completed' && "line-through text-muted-foreground")}>
              {task.title}
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {task.description}
                </p>
              )}
            </TableCell>
            <TableCell>
              {task.client_id ? (
                <Link to={`/clients/${task.client_id}`} className="text-blue-600 hover:underline">
                  View Client
                </Link>
              ) : (
                'No Client'
              )}
            </TableCell>
            <TableCell>
              {task.due_date ? format(new Date(task.due_date), 'PP') : 'No date'}
            </TableCell>
            <TableCell>{getPriorityBadge(task.priority)}</TableCell>
            <TableCell>{task.task_type || 'Follow-up'}</TableCell>
            <TableCell>{format(new Date(task.created_at), 'PP')}</TableCell>
          </TableRow>
        ))}
        
        {(!tasks || tasks.length === 0) && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
              {isLoading ? 'Loading tasks...' : 'No tasks found. Create a new task to get started.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
