
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface CommissionGoalProgressProps {
  yearToDateCommission: number;
  commissionGoal: number;
  currentYear: number;
}

export function CommissionGoalProgress({ 
  yearToDateCommission, 
  commissionGoal, 
  currentYear 
}: CommissionGoalProgressProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState(commissionGoal);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCommissionGoalMutation = useMutation({
    mutationFn: async (goal: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ commission_goal: goal })
        .eq('id', user.id);

      if (error) throw error;
      return goal;
    },
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: ['commissionGoal'] });
      toast({
        title: 'Goal Updated',
        description: `Your commission goal has been set to $${newGoal.toLocaleString()}`,
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Could not update commission goal',
        variant: 'destructive',
      });
    }
  });

  const handleSaveGoal = () => {
    if (newGoal > 0) {
      updateCommissionGoalMutation.mutate(newGoal);
    } else {
      toast({
        title: 'Invalid Goal',
        description: 'Commission goal must be greater than zero',
        variant: 'destructive',
      });
    }
  };

  const progressValue = Math.min(
    Math.round((yearToDateCommission / commissionGoal) * 100), 
    100
  );

  return (
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
          {isEditing ? (
            <div className="flex items-center justify-center space-x-2">
              <Input 
                type="number" 
                value={newGoal} 
                onChange={(e) => setNewGoal(Number(e.target.value))}
                className="w-40"
                min={1}
              />
              <Button 
                onClick={handleSaveGoal} 
                disabled={updateCommissionGoalMutation.isPending}
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-2">
                <span className="text-2xl font-bold">S${yearToDateCommission?.toLocaleString() || '0'}</span>
                <span className="text-muted-foreground"> / S${commissionGoal?.toLocaleString() || '10,000'}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {commissionGoal && yearToDateCommission && commissionGoal > yearToDateCommission
                  ? `S$${(commissionGoal - yearToDateCommission).toLocaleString()} remaining to goal`
                  : "Goal achieved! 🎉 Set a new one?"}
              </p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="mt-2"
              >
                Edit Goal
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
