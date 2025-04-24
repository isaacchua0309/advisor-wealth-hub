
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTasks, Task } from "@/hooks/useTasks";
import { PlusIcon } from 'lucide-react';
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function Tasks() {
  const { tasks, isLoading, createTask, updateTask, deleteTask } = useTasks();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    task_type: '',
    search: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTask = (task: Omit<Task, 'id' | 'user_id'>) => {
    createTask.mutate({
      ...task,
      user_id: '' // will be set by backend
    });
    setIsDialogOpen(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleTaskStatusChange = (taskId: string, status: 'pending' | 'completed' | 'overdue') => {
    updateTask.mutate({ id: taskId, status });
  };

  // Filter tasks based on selected filters and search
  const filteredTasks = tasks?.filter(task => {
    return (
      (!filters.status || task.status === filters.status) &&
      (!filters.priority || task.priority === filters.priority) &&
      (!filters.task_type || task.task_type === filters.task_type) &&
      (!filters.search || task.title.toLowerCase().includes(filters.search.toLowerCase()) || 
       (task.description && task.description.toLowerCase().includes(filters.search.toLowerCase())))
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Tasks & Follow-ups</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <PlusIcon className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm 
              onSubmit={handleCreateTask} 
              isSubmitting={createTask.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TaskFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Task List */}
      <TaskList 
        tasks={filteredTasks} 
        isLoading={isLoading}
        onStatusChange={handleTaskStatusChange}
      />
    </div>
  );
}
