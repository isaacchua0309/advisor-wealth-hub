
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ClientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function ClientSearchBar({ value, onChange }: ClientSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search clients..."
        className="pl-8"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
