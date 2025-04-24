
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, FileText, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

// Mock data for charts
const commissionData = [
  { month: "Jan", amount: 12400 },
  { month: "Feb", amount: 9800 },
  { month: "Mar", amount: 15600 },
  { month: "Apr", amount: 18200 },
  { month: "May", amount: 14300 },
  { month: "Jun", amount: 21000 },
];

const policyData = [
  { type: "Life", count: 42 },
  { type: "Health", count: 28 },
  { type: "Investment", count: 15 },
  { type: "General", count: 8 },
];

const recentClients = [
  { id: "1", name: "Sarah Chen", policies: 3, value: "S$350,000" },
  { id: "2", name: "Michael Tan", policies: 2, value: "S$210,000" },
  { id: "3", name: "Priya Kumar", policies: 1, value: "S$125,000" },
  { id: "4", name: "David Wong", policies: 4, value: "S$480,000" },
];

const upcomingTasks = [
  { id: "1", title: "Policy Review with Sarah Chen", date: "Today, 2:00 PM" },
  { id: "2", title: "Follow-up with Michael Tan", date: "Tomorrow, 10:30 AM" },
  { id: "3", title: "Send proposal to Priya Kumar", date: "Apr 26, 3:00 PM" },
  { id: "4", title: "Renewal discussion with David Wong", date: "Apr 28, 11:00 AM" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  
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
              <h3 className="stats-value">S$91,400</h3>
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
              <h3 className="stats-value">124</h3>
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
              <h3 className="stats-value">93</h3>
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
              <h3 className="stats-value">12</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Commission Overview</CardTitle>
            <CardDescription>Your commission earnings over time</CardDescription>
            <Tabs defaultValue="month" className="w-full" onValueChange={setPeriod}>
              <TabsList className="grid w-full max-w-xs grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commissionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${value/1000}k`} 
                  width={60}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Commission"]}
                  labelFormatter={(label) => `${label} 2023`}
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
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Leads</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">24</span>
                    <span className="text-xs text-muted-foreground">clients</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-full max-w-[180px]">
                  <div className="h-2 bg-crm-gray rounded-full w-[100%]"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Contacted</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">18</span>
                    <span className="text-xs text-muted-foreground">clients</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-full max-w-[180px]">
                  <div className="h-2 bg-crm-warning rounded-full w-[75%]"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Proposal</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">12</span>
                    <span className="text-xs text-muted-foreground">clients</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-full max-w-[180px]">
                  <div className="h-2 bg-crm-secondary rounded-full w-[50%]"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Closed</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">8</span>
                    <span className="text-xs text-muted-foreground">clients</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full w-full max-w-[180px]">
                  <div className="h-2 bg-crm-success rounded-full w-[33%]"></div>
                </div>
              </div>
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
              {recentClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.policies} Policies</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{client.value}</p>
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
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.date}</p>
                  </div>
                  <div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                      Upcoming
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
