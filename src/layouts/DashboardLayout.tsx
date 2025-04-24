
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { UserButton } from "@/components/UserButton";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
      toast({
        title: "Welcome back!",
        description: "Your dashboard is ready.",
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <SidebarTrigger className="mr-4 md:hidden" />
            <h1 className="text-xl font-semibold text-gray-800">AdvisorHub CRM</h1>
          </div>
          <div className="flex items-center space-x-4">
            <UserButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 mb-4"></div>
                <p className="text-muted-foreground">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
