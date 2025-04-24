
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, FileText, Calendar } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { 
    totalCommission,
    activeClients,
    activePolicies,
    pendingTasks,
    annualCommission, // Changed from monthlyCommission to annualCommission
    pipelineData,
    upcomingTasks,
    recentClients,
    isLoading,
  } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your business.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="stats-label">Total Commission</p>
              <h3 className="stats-value">S${totalCommission?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </Card>
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-accent/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-crm-accent" />
            </div>
            <div>
              <p className="stats-label">Active Clients</p>
              <h3 className="stats-value">{activeClients || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-success/20 p-3 rounded-full">
              <FileText className="h-6 w-6 text-crm-success" />
            </div>
            <div>
              <p className="stats-label">Active Policies</p>
              <h3 className="stats-value">{activePolicies || 0}</h3>
            </div>
          </div>
        </Card>
        <Card className="stats-card">
          <div className="flex items-center space-x-4">
            <div className="bg-crm-warning/20 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-crm-warning" />
            </div>
            <div>
              <p className="stats-label">Pending Tasks</p>
              <h3 className="stats-value">{pendingTasks || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Commission Overview</CardTitle>
            <CardDescription>Your annual commission earnings</CardDescription>
            {/* Removed time period tabs since we only show annual data now */}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={annualCommission}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis 
                  tickFormatter={(value) => `$${value/1000}k`} 
                  width={60}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Commission"]}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Status of your current deals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineData && Object.entries(pipelineData).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{stage}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">{count}</span>
                      <span className="text-xs text-muted-foreground">clients</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full w-full max-w-[180px]">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ 
                        width: `${(count / Math.max(...Object.values(pipelineData))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Your most recently added clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients?.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.policies} Policies</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">S${client.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Your scheduled follow-ups and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks?.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : 'No due date'}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                      {task.priority || 'Normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
