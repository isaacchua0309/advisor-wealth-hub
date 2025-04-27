
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Progress } from "@/components/ui/progress";

const goalFormSchema = z.object({
  commissionGoal: z.number().min(0, { message: "Goal must be a positive number" }),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export function CommissionGoalSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentGoal, setCurrentGoal] = useState(0);
  const [yearToDateCommission, setYearToDateCommission] = useState(0);

  const goalForm = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      commissionGoal: 10000,
    },
  });

  // Fetch user's commission goal and YTD progress on component mount
  useEffect(() => {
    const fetchGoalData = async () => {
      if (!user) return;
      
      try {
        // Fetch commission goal
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('commission_goal')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          const goal = profileData.commission_goal || 10000;
          setCurrentGoal(goal);
          goalForm.reset({
            commissionGoal: goal,
          });
        }
        
        // Calculate year-to-date commission
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).toISOString();
        
        const { data: policiesData, error: policiesError } = await supabase
          .from('policies')
          .select('first_year_commission, annual_ongoing_commission')
          .eq('user_id', user.id)
          .gte('start_date', startOfYear);
          
        if (policiesError) throw policiesError;
        
        if (policiesData) {
          const ytdCommission = policiesData.reduce((sum, policy) => {
            return sum + (policy.first_year_commission || 0) + (policy.annual_ongoing_commission || 0);
          }, 0);
          
          setYearToDateCommission(ytdCommission);
          
          // Calculate progress percentage
          const goalAmount = profileData?.commission_goal || 10000;
          const progressPercentage = Math.min((ytdCommission / goalAmount) * 100, 100);
          setCurrentProgress(progressPercentage);
        }
      } catch (error) {
        console.error("Error fetching commission goal data:", error);
      }
    };
    
    fetchGoalData();
  }, [user]);

  async function onSubmit(data: GoalFormValues) {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          commission_goal: data.commissionGoal,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update the current goal and recalculate progress
      setCurrentGoal(data.commissionGoal);
      const newProgressPercentage = Math.min((yearToDateCommission / data.commissionGoal) * 100, 100);
      setCurrentProgress(newProgressPercentage);

      toast({
        title: "Commission Goal Updated",
        description: "Your annual commission goal has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update commission goal",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Commission Goal Settings</CardTitle>
          <CardDescription>
            Set and track your annual commission goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Current Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Year-to-Date: {formatCurrency(yearToDateCommission)}</span>
                <span>Goal: {formatCurrency(currentGoal)}</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
              <div className="text-sm text-muted-foreground">
                {currentProgress.toFixed(0)}% of annual goal achieved
              </div>
            </div>
          </div>

          <Form {...goalForm}>
            <form onSubmit={goalForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={goalForm.control}
                name="commissionGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Commission Goal</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <Input 
                          type="number" 
                          className="pl-7" 
                          placeholder="10000" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Set your target commission amount for the current year
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="mt-4" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Commission Goal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
