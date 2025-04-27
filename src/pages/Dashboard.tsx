
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    totalCommission,
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

  // Calculate the commission goal progress
  useEffect(() => {
    if (yearToDateCommission && commissionGoal && commissionGoal > 0) {
      const progress = Math.min(Math.round((yearToDateCommission / commissionGoal) * 100), 100);
      setProgressValue(progress);
    }
  }, [yearToDateCommission, commissionGoal]);

  // Format pipeline data for chart display
  const pipelineChartData = pipelineData ? 
    Object.entries(pipelineData).map(([stage, count]) => ({
      stage,
      count,
    })) : [];

  // Format colors for pipeline chart
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

  // Quick create handlers
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
        
        {/* Quick Create "Speed Dial" */}
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
      
      {/* Key Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="stats-label">Total Clients</p>
              <h3 className="stats-value">{activeClients || 0}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-accent/20 p-3 rounded-full">
              <FileText className="h-6 w-6 text-crm-accent" />
            </div>
            <div>
              <p className="stats-label">Active Policies</p>
              <h3 className="stats-value">{activePolicies || 0}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-secondary/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-crm-secondary" />
            </div>
            <div>
              <p className="stats-label">Pending Commissions</p>
              <h3 className="stats-value">S${pendingCommissions?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-primary/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-crm-primary" />
            </div>
            <div>
              <p className="stats-label">Projected Income (12M)</p>
              <h3 className="stats-value">S${projectedIncome?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-success/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-crm-success" />
            </div>
            <div>
              <p className="stats-label">YTD Commission</p>
              <h3 className="stats-value">S${yearToDateCommission?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-warning/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-crm-warning" />
            </div>
            <div>
              <p className="stats-label">Upcoming Renewals</p>
              <h3 className="stats-value">{upcomingRenewals || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deal Pipeline Chart */}
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
        
        {/* Commission Goal Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Goal Progress</CardTitle>
            <CardDescription>Your progress towards {currentYear} target</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-8">
            <div className="w-40 h-40 relative flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-gray-100" 
                  strokeWidth="10" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
                <circle 
                  className="text-primary" 
                  strokeWidth="10" 
                  strokeDasharray={`${progressValue * 2.51} 251.2`} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{progressValue}%</span>
                <span className="text-sm text-muted-foreground">of goal</span>
              </div>
            </div>
            
            <div className="w-full text-center">
              <p className="mb-2">
                <span className="text-2xl font-bold">S${yearToDateCommission?.toLocaleString() || '0'}</span>
                <span className="text-muted-foreground"> / S${commissionGoal?.toLocaleString() || '10,000'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {commissionGoal && yearToDateCommission && commissionGoal > yearToDateCommission
                  ? `S$${(commissionGoal - yearToDateCommission).toLocaleString()} remaining to goal`
                  : "Goal achieved! 🎉"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications Feed */}
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
        
        {/* Client Leaderboard */}
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
      
      {/* Recent Activities Section */}
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
