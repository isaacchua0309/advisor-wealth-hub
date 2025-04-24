
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Client } from "@/types/client";

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
}

export function ClientsTable({ clients, isLoading }: ClientsTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full"></div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (clients.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-8">
          No clients found matching your search.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact Information</TableHead>
          <TableHead>Occupation</TableHead>
          <TableHead>Age Group</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow
            key={client.id}
            onClick={() => handleRowClick(client.id)}
            className="cursor-pointer hover:bg-muted/50"
          >
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>
              <div>{client.email}</div>
              <div className="text-sm text-muted-foreground">{client.phone}</div>
            </TableCell>
            <TableCell>{client.occupation}</TableCell>
            <TableCell>{client.age_group}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
