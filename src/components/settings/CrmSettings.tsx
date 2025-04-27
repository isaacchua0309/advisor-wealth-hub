
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

const crmFormSchema = z.object({
  companyName: z.string().optional(),
  defaultCurrency: z.string(),
  defaultTimezone: z.string(),
  defaultPipelineStage: z.string(),
  defaultReminderDays: z.number().int().min(0).max(30),
});

type CrmFormValues = z.infer<typeof crmFormSchema>;

export function CrmSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const crmForm = useForm<CrmFormValues>({
    resolver: zodResolver(crmFormSchema),
    defaultValues: {
      companyName: "",
      defaultCurrency: "USD",
      defaultTimezone: "UTC",
      defaultPipelineStage: "Lead",
      defaultReminderDays: 3,
    },
  });

  // Fetch user's CRM settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_name, default_currency, default_timezone, default_pipeline_stage, default_reminder_days')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          crmForm.reset({
            companyName: data.company_name || "",
            defaultCurrency: data.default_currency || "USD",
            defaultTimezone: data.default_timezone || "UTC",
            defaultPipelineStage: data.default_pipeline_stage || "Lead",
            defaultReminderDays: data.default_reminder_days || 3,
          });
        }
      } catch (error) {
        console.error("Error fetching CRM settings:", error);
      }
    };
    
    fetchSettings();
  }, [user, crmForm]);

  async function onSubmit(data: CrmFormValues) {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company_name: data.companyName,
          default_currency: data.defaultCurrency,
          default_timezone: data.defaultTimezone,
          default_pipeline_stage: data.defaultPipelineStage,
          default_reminder_days: data.defaultReminderDays,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "CRM Settings Updated",
        description: "Your CRM preferences have been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update CRM settings",
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
          <CardTitle>CRM Preferences</CardTitle>
          <CardDescription>
            Configure your default CRM settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...crmForm}>
            <form onSubmit={crmForm.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={crmForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Company Name
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your agency or company name</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company, LLC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={crmForm.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This currency will be used for displaying all financial values
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={crmForm.control}
                name="defaultTimezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={crmForm.control}
                name="defaultPipelineStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Pipeline Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      New clients will start at this pipeline stage by default
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={crmForm.control}
                name="defaultReminderDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Default Follow-up Days
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="ml-1 h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Default number of days for follow-up reminders</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={0} 
                        max={30} 
                        placeholder="3" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} 
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-set follow-up reminders this many days after client meetings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="mt-4" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save CRM Settings"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
