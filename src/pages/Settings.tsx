
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { CrmSettings } from "@/components/settings/CrmSettings";
import { CommissionGoalSettings } from "@/components/settings/CommissionGoalSettings";
import { AccountManagementSettings } from "@/components/settings/AccountManagementSettings";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Customize your account and application preferences.
          </p>
        </div>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-7 w-full md:w-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="crm" className="space-y-6">
            <CrmSettings />
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-6">
            <CommissionGoalSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <ThemeSettings />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <AccountSettings showProfileSection={false} showSecuritySection={true} />
          </TabsContent>
          
          <TabsContent value="management" className="space-y-6">
            <AccountManagementSettings />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
