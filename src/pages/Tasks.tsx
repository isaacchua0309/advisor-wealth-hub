
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTasks, Task } from "@/hooks/useTasks";
import { PlusIcon } from 'lucide-react';
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskKPICards } from "@/components/tasks/TaskKPICards";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const { tasks, isLoading, createTask, updateTask } = useTasks();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    task_type: 'all',
    due_date_start: undefined as Date | undefined,
    due_date_end: undefined as Date | undefined,
    search: ''
  });

  const handleCreateTask = (task: Omit<Task, 'id' | 'user_id'>) => {
    createTask.mutate({
      ...task,
      user_id: '' // will be set by backend
    });
    setIsDialogOpen(false);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleTaskStatusChange = (taskId: string, status: 'pending' | 'completed' | 'overdue') => {
    updateTask.mutate({ id: taskId, status });
    if (status === 'completed') {
      toast({
        title: "Task completed! 🎉",
        description: "Keep up the great work!"
      });
    }
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleBulkComplete = () => {
    selectedTasks.forEach(taskId => {
      handleTaskStatusChange(taskId, 'completed');
    });
    setSelectedTasks([]);
  };

  // Filter tasks based on selected filters and search
  const filteredTasks = tasks?.filter(task => {
    return (
      (filters.status === 'all' || task.status === filters.status) &&
      (filters.priority === 'all' || task.priority === filters.priority) &&
      (filters.task_type === 'all' || task.task_type === filters.task_type) &&
      (!filters.due_date_start || new Date(task.due_date!) >= filters.due_date_start) &&
      (!filters.due_date_end || new Date(task.due_date!) <= filters.due_date_end) &&
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

      {/* KPI Cards */}
      <TaskKPICards tasks={tasks} />

      {/* Filters */}
      <TaskFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
      />

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="mb-4 p-2 bg-muted rounded-lg flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedTasks.length} task(s) selected
          </span>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleBulkComplete}
          >
            Mark as Complete
          </Button>
        </div>
      )}

      {/* Task List */}
      <TaskList 
        tasks={filteredTasks} 
        isLoading={isLoading}
        onStatusChange={handleTaskStatusChange}
        selectedTasks={selectedTasks}
        onSelectTask={handleSelectTask}
      />
    </div>
  );
}
