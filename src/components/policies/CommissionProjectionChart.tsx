
import { Policy } from "@/types/policy";
import { calculateYearlyCommissions, formatCurrency } from "./PolicyUtils";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CommissionProjectionChartProps {
  policies: Policy[];
  years?: number;
  onYearSelect?: (year: number) => void;
  selectedYear?: number | null;
}

interface ChartDataItem {
  year: string;
  commission: number;
  firstYear: number;
  ongoing: number;
  isSelected: boolean;
}

export default function CommissionProjectionChart({ 
  policies, 
  years = 10, 
  onYearSelect,
  selectedYear 
}: CommissionProjectionChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [policyTypeFilter, setPolicyTypeFilter] = useState<string>("all");
  
  const currentYear = new Date().getFullYear();

  // Filter policies by type if needed
  const filteredPolicies = policyTypeFilter === "all" 
    ? policies 
    : policies.filter(p => p.policy_type === policyTypeFilter);
  
  const commissionData = calculateYearlyCommissions(filteredPolicies, currentYear, years);
  
  // Find the year with the highest commission for highlighting
  const maxCommissionYear = commissionData.reduce(
    (max, current) => current.amount > max.amount ? current : max, 
    { year: 0, amount: 0 }
  );
  
  // Calculate the next year's projected commission
  const nextYearCommission = commissionData.length > 1 ? commissionData[1].amount : 0;
  
  // Get unique policy types for the filter
  const policyTypes = Array.from(new Set(policies.map(p => p.policy_type))).sort();
  
  // Configure the chart theme
  const chartConfig = {
    commission: {
      label: "Annual Commission",
      color: "#10b981" // emerald-500
    },
    firstYear: {
      label: "First Year Commission",
      color: "#3b82f6" // blue-500
    },
    ongoing: {
      label: "Ongoing Commission",
      color: "#8b5cf6" // purple-500
    }
  };
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number) => {
    return formatCurrency(value);
  };
  
  // Transform data for recharts with first year and ongoing breakdown
  const chartData = commissionData.map((item) => {
    // Simple estimation of first year vs ongoing split
    // In real app, this would calculate from actual policies
    const firstYearPart = item.amount * 0.4; // Simplified estimate
    const ongoingPart = item.amount * 0.6; // Simplified estimate
    
    return {
      year: item.year.toString(),
      commission: item.amount,
      firstYear: firstYearPart,
      ongoing: ongoingPart,
      isSelected: selectedYear === item.year
    };
  });
  
  // Handle bar click for filtering
  const handleBarClick = (data: any) => {
    if (onYearSelect && data && data.activePayload && data.activePayload[0]) {
      const yearClicked = parseInt(data.activePayload[0].payload.year);
      onYearSelect(yearClicked);
    }
  };
  
  // Check for mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Dynamically calculate max bar size based on number of years
  const dynamicMaxBarSize = Math.min(60, 300 / commissionData.length);
  
  return (
    <Card className="mb-6 w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Commission Projection</CardTitle>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by:</span>
            <Select value={policyTypeFilter} onValueChange={setPolicyTypeFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Policy Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Policy Types</SelectItem>
                {policyTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <CardDescription className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
          <div className="font-medium">
            Next Year: <span className="text-green-600">{formatCurrency(nextYearCommission)}</span>
          </div>
          {maxCommissionYear.year > 0 && (
            <div className="font-medium">
              Highest Year: <span className="text-green-600">{maxCommissionYear.year}</span> ({formatCurrency(maxCommissionYear.amount)})
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-4">
        <div className="w-full overflow-hidden">
          <div className="min-w-[500px] chart-container">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" aspect={2.5}>
                <BarChart 
                  data={chartData} 
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                  onClick={onYearSelect ? handleBarClick : undefined}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    interval={isMobile ? Math.ceil(commissionData.length / 6) : 0}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={tooltipFormatter}
                    domain={[0, 'auto']}
                    tick={{ fontSize: 10 }}
                    width={60}
                    tickCount={5}
                    scale="linear"
                  />
                  <Tooltip content={
                    <ChartTooltipContent 
                      formatter={(value, name) => {
                        // Custom tooltip content
                        if (name === "commission") return [formatCurrency(value as number), "Total"];
                        if (name === "firstYear") return [formatCurrency(value as number), "First Year"];
                        if (name === "ongoing") return [formatCurrency(value as number), "Ongoing"];
                        return [value, name];
                      }}
                    />
                  } />
                  <Legend />
                  <Bar 
                    dataKey="commission" 
                    name="Annual Commission" 
                    fillOpacity={0.9}
                    className="cursor-pointer"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={dynamicMaxBarSize}
                    cursor={onYearSelect ? "pointer" : undefined}
                    fill="#10b981"
                    style={{
                      cursor: onYearSelect ? "pointer" : "default",
                      fill: "var(--color-commission)",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        {onYearSelect && (
          <div className="text-center text-xs text-muted-foreground mt-2 mb-4">
            Click on a bar to filter policies by that year
          </div>
        )}
      </CardContent>
    </Card>
  );
}
