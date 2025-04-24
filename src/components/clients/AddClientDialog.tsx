
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateClientForm } from "./CreateClientForm";
import type { CreateClientInput } from "@/types/client";
import type { CreatePolicyInput } from "@/types/policy";

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (client: CreateClientInput, policies: CreatePolicyInput[]) => Promise<void>;
  isPending: boolean;
}

export function AddClientDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isPending 
}: AddClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the client's details below to create a new client record. You can also add insurance policies for this client.
          </DialogDescription>
        </DialogHeader>
        
        <CreateClientForm 
          onSubmit={onSubmit} 
          isPending={isPending} 
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
