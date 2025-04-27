
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Task } from "@/hooks/useTasks";

interface TaskFormProps {
  initialTask?: Partial<Task>;
  onSubmit: (task: Omit<Task, 'id' | 'user_id'>) => void;
  isSubmitting?: boolean;
}

export function TaskForm({ initialTask, onSubmit, isSubmitting = false }: TaskFormProps) {
  const [task, setTask] = useState<{
    title: string;
    description: string;
    due_date: Date;
    priority: 'low' | 'medium' | 'high';
    task_type: string;
    client_id?: string | null;
  }>({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    due_date: initialTask?.due_date ? new Date(initialTask.due_date) : new Date(),
    priority: initialTask?.priority || 'medium' as 'low' | 'medium' | 'high',
    task_type: initialTask?.task_type || 'follow-up',
    client_id: initialTask?.client_id || null,
  });

  const handleSubmit = () => {
    onSubmit({
      ...task,
      due_date: task.due_date.toISOString(),
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Task Title
        </label>
        <Input 
          id="title" 
          placeholder="Task Title"
          value={task.title}
          onChange={(e) => setTask({...task, title: e.target.value})}
        />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Textarea 
          id="description" 
          placeholder="Task description..."
          value={task.description}
          onChange={(e) => setTask({...task, description: e.target.value})}
        />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="due-date" className="text-sm font-medium">
          Due Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="due-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !task.due_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {task.due_date ? format(task.due_date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={task.due_date}
              onSelect={(date) => date && setTask({...task, due_date: date})}
              className="pointer-events-auto" 
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <Select 
          value={task.priority} 
          onValueChange={(value) => setTask({...task, priority: value as 'low' | 'medium' | 'high'})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="task-type" className="text-sm font-medium">
          Task Type
        </label>
        <Select 
          value={task.task_type} 
          onValueChange={(value) => setTask({...task, task_type: value})}
        >
          <SelectTrigger id="task-type">
            <SelectValue placeholder="Select task type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="call">Call</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={!task.title || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Task"}
        </Button>
      </div>
    </div>
  );
}
