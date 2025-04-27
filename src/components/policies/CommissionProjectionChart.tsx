
import { Policy } from "@/types/policy";
import { calculateYearlyCommissions, formatCurrency } from "./PolicyUtils";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CommissionProjectionChartProps {
  policies: Policy[];
  years?: number;
}

export default function CommissionProjectionChart({ policies, years = 10 }: CommissionProjectionChartProps) {
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
  const maxCommissionAmount = Math.max(...commissionData.map(item => item.amount));
  const yAxisMax = maxCommissionAmount * 1.2; // 20% buffer
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number) => {
    return formatCurrency(value);
  };
  
  // Transform data for recharts
  const chartData = commissionData.map((item) => ({
    year: item.year.toString(),
    commission: item.amount
  }));
  
  return (
    <Card className="mb-10">
      <CardHeader>
        <CardTitle>Commission Projection</CardTitle>
        <CardDescription className="flex flex-col sm:flex-row gap-4">
          <div className="font-medium">
            Next Year's Projected Commission: <span className="text-green-600">{formatCurrency(nextYearCommission)}</span>
          </div>
          {maxCommissionYear.year > 0 && (
            <div className="font-medium">
              Highest Projected Year: <span className="text-green-600">{maxCommissionYear.year}</span> ({formatCurrency(maxCommissionYear.amount)})
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={tooltipFormatter}
                  domain={[0, yAxisMax]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltipContent formatter={tooltipFormatter} />} />
                <Legend />
                <Bar 
                  dataKey="commission" 
                  name="Annual Commission" 
                  fill="var(--color-commission)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={commissionData.length > 6 ? 40 : 60} // Adjust bar width based on data points
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
