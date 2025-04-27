
import { Card } from "@/components/ui/card";
import { Task } from "@/hooks/useTasks";

interface TaskKPICardsProps {
  tasks: Task[] | undefined;
}

export function TaskKPICards({ tasks = [] }: TaskKPICardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison
  
  const pendingTasks = tasks?.filter(task => task.status === 'pending').length || 0;
  
  // Overdue tasks: due date is in the past AND not completed
  const overdueTasks = tasks?.filter(task => {
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    return dueDate && 
           dueDate < today && 
           task.status !== 'completed';
  }).length || 0;
  
  const completedThisWeek = tasks?.filter(task => {
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return task.status === 'completed' && new Date(task.created_at) > weekAgo;
  }).length || 0;
  
  // Only count pending high priority tasks (not completed ones)
  const highPriorityTasks = tasks?.filter(task => 
    task.priority === 'high' && task.status !== 'completed'
  ).length || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Pending Tasks</span>
          <span className="text-2xl font-bold mt-1">{pendingTasks}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Overdue Tasks</span>
          <span className="text-2xl font-bold mt-1 text-red-600">{overdueTasks}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">Completed This Week</span>
          <span className="text-2xl font-bold mt-1 text-green-600">{completedThisWeek}</span>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">High Priority Tasks</span>
          <span className="text-2xl font-bold mt-1 text-amber-600">{highPriorityTasks}</span>
        </div>
      </Card>
    </div>
  );
}
