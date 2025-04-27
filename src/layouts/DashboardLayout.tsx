
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";

import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@/components/ui/user-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Nav } from "@/components/ui/nav";
import {
  Home,
  Users,
  FileText,
  PieChart,
  Settings,
  CheckSquare,
  ClipboardList,
  PlusCircle
} from "lucide-react";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      tooltip: "Dashboard",
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      tooltip: "Clients",
    },
    {
      title: "Policies",
      href: "/policies",
      icon: FileText,
      tooltip: "Policies",
    },
    {
      title: "Global Policies",
      href: "/global-policies",
      icon: ClipboardList,
      tooltip: "Global Policies",
    },
    {
      title: "Pipeline",
      href: "/pipeline",
      icon: PieChart,
      tooltip: "Pipeline",
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      tooltip: "Tasks",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      tooltip: "Settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar>
        <SidebarHeader className="flex items-center justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold">InsureTrack</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex flex-col gap-4">
          <Nav links={mainNavItems} />
        </SidebarContent>
        <SidebarFooter>
          <UserButton />
          <ThemeToggle />
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          
          {/* Quick action buttons */}
          <div className="ml-auto flex items-center gap-3">
            <Link 
              to="/clients/new"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add Client</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
