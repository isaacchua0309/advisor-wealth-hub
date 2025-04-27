import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users, 
  FileText, 
  Calendar, 
  AlertCircle, 
  PlusCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Bell
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { CommissionGoalProgress } from "@/components/dashboard/CommissionGoalProgress";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    totalClients,
    activeClients,
    activePolicies,
    pendingTasks,
    annualCommission,
    pipelineData,
    upcomingTasks,
    recentClients,
    pendingCommissions,
    projectedIncome,
    yearToDateCommission,
    upcomingRenewals,
    commissionGoal,
    isLoading,
  } = useDashboard();

  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (yearToDateCommission && commissionGoal && commissionGoal > 0) {
      const progress = Math.min(Math.round((yearToDateCommission / commissionGoal) * 100), 100);
      setProgressValue(progress);
    }
  }, [yearToDateCommission, commissionGoal]);

  const pipelineChartData = pipelineData ? 
    Object.entries(pipelineData).map(([stage, count]) => ({
      stage,
      count,
    })) : [];

  const PIPELINE_COLORS = {
    'Lead': '#9b87f5',
    'Contacted': '#7E69AB',
    'Proposal Sent': '#6E59A5',
    'Negotiation': '#8B5CF6',
    'Closed Won': '#10B981',
    'Closed Lost': '#EF4444',
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const currentYear = new Date().getFullYear();

  const handleQuickCreate = (type: string) => {
    switch (type) {
      case "client":
        navigate("/clients?action=create");
        break;
      case "policy":
        navigate("/policies?action=create");
        break;
      case "task":
        navigate("/tasks?action=create");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="mt-4 sm:mt-0" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Quick Create
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleQuickCreate("client")}>
              <Users className="mr-2 h-4 w-4" />
              Add Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickCreate("policy")}>
              <FileText className="mr-2 h-4 w-4" />
              Add Policy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickCreate("task")}>
              <Calendar className="mr-2 h-4 w-4" />
              Create Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DashboardKPICards 
        totalClients={totalClients || 0}
        activePolicies={activePolicies || 0}
        pendingCommissions={pendingCommissions || 0}
        projectedIncome={projectedIncome || 0}
        yearToDateCommission={yearToDateCommission || 0}
        upcomingRenewals={upcomingRenewals || 0}
      />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Status of your current deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={pipelineChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="stage" 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} clients`, "Count"]}
                    labelFormatter={(label) => `Stage: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 4, 4, 0]}
                  >
                    {pipelineChartData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.stage}`} 
                        fill={PIPELINE_COLORS[entry.stage as keyof typeof PIPELINE_COLORS] || "#8B5CF6"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <CommissionGoalProgress 
          yearToDateCommission={yearToDateCommission}
          commissionGoal={commissionGoal}
          currentYear={currentYear}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Important Actions
            </CardTitle>
            <CardDescription>Alerts and tasks requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks && upcomingTasks.length > 0 ? (
                upcomingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      {task.priority === 'High' ? (
                        <AlertCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                        {task.priority || 'Normal'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <h3 className="text-lg font-medium">No pending tasks</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    You have no urgent tasks or notifications at the moment
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Clients by Value</CardTitle>
            <CardDescription>Your highest value clients</CardDescription>
          </CardHeader>
          <CardContent>
            {recentClients && recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((client, index) => (
                    <div 
                      key={client.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      onClick={() => navigate(`/clients/${client.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                          index === 1 ? 'bg-gray-100 text-gray-800' : 
                          index === 2 ? 'bg-amber-100 text-amber-800' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        <p className="font-medium">{client.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">S${client.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{client.policies} Policies</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No clients found</h3>
                <p className="text-sm text-muted-foreground">
                  Add clients and policies to see your top performers
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates across your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClients && recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">New client added</p>
                      <p className="text-sm text-muted-foreground">
                        {client.name} was added with {client.policies} {client.policies === 1 ? 'policy' : 'policies'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total value: S${client.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-medium">No recent activities</h3>
                <p className="text-sm text-muted-foreground">
                  Recent client and policy activities will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
