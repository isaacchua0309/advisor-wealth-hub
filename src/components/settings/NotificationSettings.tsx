
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function NotificationSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // For email notifications
  const [emailNotifications, setEmailNotifications] = useState({
    taskReminders: true,
    clientUpdates: true,
    commissionReports: false,
    policyRenewals: true,
    weeklyDigest: false,
  });
  
  // For in-app notifications
  const [appNotifications, setAppNotifications] = useState({
    upcomingTasks: true,
    pipelineUpdates: true,
    clientMessages: true,
    systemAnnouncements: true,
  });
  
  // For push notifications (mobile)
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushNotifications, setPushNotifications] = useState({
    urgentTasks: true,
    importantClientUpdates: true,
    deadlineReminders: true,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications({
      ...emailNotifications,
      [key]: !emailNotifications[key],
    });
  };

  const handleAppToggle = (key: keyof typeof appNotifications) => {
    setAppNotifications({
      ...appNotifications,
      [key]: !appNotifications[key],
    });
  };

  const handlePushToggle = (key: keyof typeof pushNotifications) => {
    setPushNotifications({
      ...pushNotifications,
      [key]: !pushNotifications[key],
    });
  };

  const saveNotificationSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Save to user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_preferences: {
            email: emailNotifications,
            app: appNotifications,
            push: {
              enabled: pushEnabled,
              settings: pushNotifications,
            },
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" /> Email Notifications
          </CardTitle>
          <CardDescription>
            Configure which emails you receive from the CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-task-reminders" className="flex flex-col">
              <span>Task Reminders</span>
              <span className="text-sm text-muted-foreground">
                Receive emails about upcoming task deadlines
              </span>
            </Label>
            <Switch
              id="email-task-reminders"
              checked={emailNotifications.taskReminders}
              onCheckedChange={() => handleEmailToggle('taskReminders')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-client-updates" className="flex flex-col">
              <span>Client Updates</span>
              <span className="text-sm text-muted-foreground">
                Notifications when clients update their information
              </span>
            </Label>
            <Switch
              id="email-client-updates"
              checked={emailNotifications.clientUpdates}
              onCheckedChange={() => handleEmailToggle('clientUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-commission-reports" className="flex flex-col">
              <span>Commission Reports</span>
              <span className="text-sm text-muted-foreground">
                Regular reports on your commission earnings
              </span>
            </Label>
            <Switch
              id="email-commission-reports"
              checked={emailNotifications.commissionReports}
              onCheckedChange={() => handleEmailToggle('commissionReports')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-policy-renewals" className="flex flex-col">
              <span>Policy Renewals</span>
              <span className="text-sm text-muted-foreground">
                Alerts about upcoming client policy renewals
              </span>
            </Label>
            <Switch
              id="email-policy-renewals"
              checked={emailNotifications.policyRenewals}
              onCheckedChange={() => handleEmailToggle('policyRenewals')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="email-weekly-digest" className="flex flex-col">
              <span>Weekly Digest</span>
              <span className="text-sm text-muted-foreground">
                A weekly summary of your CRM activity
              </span>
            </Label>
            <Switch
              id="email-weekly-digest"
              checked={emailNotifications.weeklyDigest}
              onCheckedChange={() => handleEmailToggle('weeklyDigest')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" /> In-App Notifications
          </CardTitle>
          <CardDescription>
            Control which notifications appear within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="app-upcoming-tasks" className="flex flex-col">
              <span>Upcoming Tasks</span>
              <span className="text-sm text-muted-foreground">
                Notifications for tasks due soon
              </span>
            </Label>
            <Switch
              id="app-upcoming-tasks"
              checked={appNotifications.upcomingTasks}
              onCheckedChange={() => handleAppToggle('upcomingTasks')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="app-pipeline-updates" className="flex flex-col">
              <span>Pipeline Updates</span>
              <span className="text-sm text-muted-foreground">
                Changes to your client pipeline stages
              </span>
            </Label>
            <Switch
              id="app-pipeline-updates"
              checked={appNotifications.pipelineUpdates}
              onCheckedChange={() => handleAppToggle('pipelineUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="app-client-messages" className="flex flex-col">
              <span>Client Messages</span>
              <span className="text-sm text-muted-foreground">
                Notification when you receive client messages
              </span>
            </Label>
            <Switch
              id="app-client-messages"
              checked={appNotifications.clientMessages}
              onCheckedChange={() => handleAppToggle('clientMessages')}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="app-system-announcements" className="flex flex-col">
              <span>System Announcements</span>
              <span className="text-sm text-muted-foreground">
                Important system updates and announcements
              </span>
            </Label>
            <Switch
              id="app-system-announcements"
              checked={appNotifications.systemAnnouncements}
              onCheckedChange={() => handleAppToggle('systemAnnouncements')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" /> Push Notifications
          </CardTitle>
          <CardDescription>
            Configure mobile push notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 mb-6">
            <Label htmlFor="enable-push" className="flex flex-col">
              <span>Enable Push Notifications</span>
              <span className="text-sm text-muted-foreground">
                Allow this application to send push notifications to your device
              </span>
            </Label>
            <Switch
              id="enable-push"
              checked={pushEnabled}
              onCheckedChange={() => setPushEnabled(!pushEnabled)}
            />
          </div>
          
          {pushEnabled && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="push-settings">
                <AccordionTrigger>Configure Push Notifications</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="push-urgent-tasks" 
                      checked={pushNotifications.urgentTasks}
                      onCheckedChange={() => handlePushToggle('urgentTasks')} 
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="push-urgent-tasks" className="text-sm font-medium">
                        Urgent Tasks
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        High priority tasks that require immediate attention
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="push-client-updates" 
                      checked={pushNotifications.importantClientUpdates}
                      onCheckedChange={() => handlePushToggle('importantClientUpdates')} 
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="push-client-updates" className="text-sm font-medium">
                        Important Client Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Significant changes to client status or information
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="push-deadline-reminders" 
                      checked={pushNotifications.deadlineReminders}
                      onCheckedChange={() => handlePushToggle('deadlineReminders')} 
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="push-deadline-reminders" className="text-sm font-medium">
                        Deadline Reminders
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications when task deadlines are approaching
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>
      
      <Button onClick={saveNotificationSettings} className="w-full" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Notification Preferences"}
      </Button>
    </div>
  );
}
