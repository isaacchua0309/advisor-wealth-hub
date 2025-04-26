
import { Link } from "react-router-dom";
import { useMatch } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

interface NavProps {
  links: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    tooltip?: string;
  }[];
  showLabels?: boolean;
}

export function Nav({ links, showLabels = true }: NavProps) {
  const { collapsed } = useSidebar();
  const shouldShowLabels = showLabels && !collapsed;
  
  return (
    <nav className="grid gap-1">
      {links.map((link, i) => {
        const Icon = link.icon;
        const active = !!useMatch({
          path: link.href === "/" ? "/" : `${link.href}/*`,
          end: link.href === "/",
        });

        const navLink = (
          <Link
            key={`${link.href}-${i}`}
            to={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {shouldShowLabels && <span>{link.title}</span>}
          </Link>
        );

        if (collapsed && link.tooltip) {
          return (
            <TooltipProvider key={`${link.href}-${i}`}>
              <Tooltip>
                <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                <TooltipContent side="right">{link.title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return navLink;
      })}
    </nav>
  );
}
