
import { Home, Users, FileText, LineChart, Calendar, Settings, FileStack } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/UserButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-3 py-2 flex items-center justify-between h-14">
        <SidebarTrigger className="h-8 w-8" />
        <h1 className="text-lg font-semibold">InsureTech</h1>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <nav className="space-y-0.5">
          <NavLink to="/" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/clients" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Users className="mr-2 h-4 w-4" />
                Clients
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/policies" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                Policies
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/global-policies" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <FileStack className="mr-2 h-4 w-4" />
                Global Policies
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/pipeline" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <LineChart className="mr-2 h-4 w-4" />
                Pipeline
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/tasks" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Tasks
              </Button>
            )}
          </NavLink>
          
          <NavLink to="/settings" className="block">
            {({ isActive: active }) => (
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
          </NavLink>
        </nav>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-2">
        <div className="flex items-center justify-between">
          <UserButton />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
