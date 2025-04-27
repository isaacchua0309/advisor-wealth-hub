
import { Policy } from "@/types/policy";
import { calculateYearlyCommissions, formatCurrency } from "./PolicyUtils";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";

interface CommissionProjectionChartProps {
  policies: Policy[];
  years?: number;
  onYearSelect?: (year: number) => void;
  selectedYear?: number | null;
}

export default function CommissionProjectionChart({ 
  policies, 
  years = 10, 
  onYearSelect,
  selectedYear 
}: CommissionProjectionChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const currentYear = new Date().getFullYear();
  const commissionData = calculateYearlyCommissions(policies, currentYear, years);
  
  // Find the year with the highest commission for highlighting
  const maxCommissionYear = commissionData.reduce(
    (max, current) => current.amount > max.amount ? current : max, 
    { year: 0, amount: 0 }
  );
  
  // Calculate the next year's projected commission
  const nextYearCommission = commissionData.length > 1 ? commissionData[1].amount : 0;
  
  // Configure the chart theme
  const chartConfig = {
    commission: {
      label: "Annual Commission",
      color: "#10b981" // emerald-500
    }
  };
  
  // Calculate the y-axis max value with a 20% buffer to prevent bars from being too tall
  const maxCommissionAmount = Math.max(...commissionData.map(item => item.amount), 100); // Set minimum to 100
  const yAxisMax = maxCommissionAmount * 1.2; // 20% buffer
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number) => {
    return formatCurrency(value);
  };
  
  // Transform data for recharts
  const chartData = commissionData.map((item) => ({
    year: item.year.toString(),
    commission: item.amount,
    isSelected: selectedYear === item.year
  }));
  
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

  // Custom style function for bar fills
  const getBarFill = (entry: any) => {
    if (entry.isSelected) {
      return "#047857";
    }
    return "var(--color-commission)";
  };
  
  return (
    <Card className="mb-10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Commission Projection</CardTitle>
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
        <div className="chart-container w-full overflow-x-auto">
          <div className="h-[250px] sm:h-[300px] min-w-[500px]">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  onClick={onYearSelect ? handleBarClick : undefined}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                    interval={isMobile ? 1 : 0}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={tooltipFormatter}
                    domain={[0, yAxisMax]}
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <Tooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                  <Legend />
                  <Bar 
                    dataKey="commission" 
                    name="Annual Commission" 
                    fillOpacity={0.9}
                    className="cursor-pointer"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={isMobile ? 20 : (commissionData.length > 6 ? 40 : 60)}
                    cursor={onYearSelect ? "pointer" : undefined}
                    fill="var(--color-commission)"
                    style={{
                      cursor: onYearSelect ? "pointer" : "default",
                    }}
                    // Use fill function to conditionally apply colors
                    fill={(entry) => getBarFill(entry)}
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
