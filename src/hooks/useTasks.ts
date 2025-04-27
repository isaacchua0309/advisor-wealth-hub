
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export type Task = {
  id?: string;
  title: string;
  description?: string;
  client_id?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'overdue';
  task_type?: string;
  user_id: string;
  created_at: string;
};

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch tasks with optional filters
  const fetchTasks = async (filters: {
    client_id?: string;
    status?: string;
    priority?: string;
    task_type?: string;
  } = {}) => {
    let query = supabase.from('tasks').select(`
      *,
      clients(name)
    `).eq('user_id', user?.id);

    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);
    if (filters.task_type) query = query.eq('task_type', filters.task_type);

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return data as Task[];
  };

  // Use React Query to fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
    enabled: !!user,
  });

  // Create a new task
  const createTask = useMutation({
    mutationFn: async (task: Task) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ 
          ...task, 
          user_id: user?.id,
          status: task.status || 'pending',
          created_at: new Date().toISOString() 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Created",
        description: "Your new task has been added successfully.",
      });
    },
  });

  // Update a task
  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Updated",
        description: "Your task has been successfully updated.",
      });
    },
  });

  // Delete a task
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Deleted",
        description: "The task has been removed.",
      });
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
  };
}
