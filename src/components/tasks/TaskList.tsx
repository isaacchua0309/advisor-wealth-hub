
import React from 'react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Task } from "@/hooks/useTasks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskListProps {
  tasks: Task[] | undefined;
  isLoading: boolean;
  onStatusChange: (taskId: string, status: 'pending' | 'completed' | 'overdue') => void;
  selectedTasks: string[];
  onSelectTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ 
  tasks, 
  isLoading, 
  onStatusChange, 
  selectedTasks, 
  onSelectTask,
  onEditTask,
  onDeleteTask
}: TaskListProps) {
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

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

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      onDeleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
  };

  // Sort tasks: overdue first, then by due date
  const sortedTasks = tasks?.slice().sort((a, b) => {
    // Sort overdue tasks to the top
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    
    // Then sort by due date
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    return a.due_date ? -1 : b.due_date ? 1 : 0;
  });

  return (
    <>
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
            <TableHead className="text-right">Actions</TableHead>
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
              <TableCell className="text-right space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditTask(task)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(task.id!)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          
          {(!tasks || tasks.length === 0) && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                {isLoading ? 'Loading tasks...' : 'No tasks found. Create a new task to get started.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
