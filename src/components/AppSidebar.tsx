
import { NavLink } from "react-router-dom";
import { Home, Users, FileText, PieChart, Calendar, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    title: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    title: "Policies",
    icon: FileText,
    href: "/policies",
  },
  {
    title: "Pipeline",
    icon: PieChart,
    href: "/pipeline",
  },
  {
    title: "Tasks",
    icon: Calendar,
    href: "/tasks",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="p-4 flex items-center justify-center border-b border-sidebar-border">
        <span className="text-xl font-bold text-white">AdvisorHub</span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href} 
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
