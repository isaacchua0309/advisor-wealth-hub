
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useTasks } from "@/hooks/useTasks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon } from 'lucide-react';

export default function Tasks() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    task_type: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: new Date(),
    priority: 'medium',
    task_type: 'follow-up'
  });

  const handleCreateTask = () => {
    createTask.mutate({
      ...newTask,
      due_date: newTask.due_date.toISOString(),
      user_id: '' // will be set by backend
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Tasks & Follow-ups</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="default">
              <PlusIcon className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            {/* Task creation form would go here */}
            <Input 
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            {/* Similar inputs for description, date, priority, etc. */}
            <Button onClick={handleCreateTask}>Save Task</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Select onValueChange={(val) => setFilters({...filters, status: val})}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        {/* Similar selects for priority, task type */}
      </div>

      {/* Task List */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Task Description</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks?.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox 
                  checked={task.status === 'completed'}
                  onCheckedChange={() => 
                    updateTask.mutate({ 
                      id: task.id!, 
                      status: task.status === 'completed' ? 'pending' : 'completed' 
                    })
                  }
                />
              </TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.client_id || 'No Client'}</TableCell>
              <TableCell>{task.due_date}</TableCell>
              <TableCell>{task.priority}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
