
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Mail, Bell, Clock, Calendar } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const notificationFormSchema = z.object({
  taskReminders: z.boolean(),
  policyRenewals: z.boolean(),
  commissionUpdates: z.boolean(),
  pipelineChanges: z.boolean(),
  newClients: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export function NotificationSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      taskReminders: true,
      policyRenewals: true,
      commissionUpdates: true,
      pipelineChanges: false,
      newClients: true,
    },
  });

  // Fetch user's notification settings on component mount
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('notification_settings')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data && data.notification_settings) {
          notificationForm.reset({
            taskReminders: data.notification_settings.taskReminders ?? true,
            policyRenewals: data.notification_settings.policyRenewals ?? true,
            commissionUpdates: data.notification_settings.commissionUpdates ?? true,
            pipelineChanges: data.notification_settings.pipelineChanges ?? false,
            newClients: data.notification_settings.newClients ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      }
    };
    
    fetchNotificationSettings();
  }, [user]);

  async function onSubmit(data: NotificationFormValues) {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_settings: data,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" /> Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={notificationForm.control}
                  name="taskReminders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="font-medium">Task Reminders</FormLabel>
                        </div>
                        <FormDescription>
                          Get notified about upcoming and overdue tasks
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="policyRenewals"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="font-medium">Policy Renewals</FormLabel>
                        </div>
                        <FormDescription>
                          Get alerts when policies are approaching renewal dates
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="commissionUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="font-medium">Commission Updates</FormLabel>
                        </div>
                        <FormDescription>
                          Get notified about changes to your commission earnings
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="pipelineChanges"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="font-medium">Pipeline Changes</FormLabel>
                        </div>
                        <FormDescription>
                          Get notified when clients move between pipeline stages
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={notificationForm.control}
                  name="newClients"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-primary" />
                          <FormLabel className="font-medium">New Clients</FormLabel>
                        </div>
                        <FormDescription>
                          Get notified when new clients are added to your account
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Notification Preferences"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
