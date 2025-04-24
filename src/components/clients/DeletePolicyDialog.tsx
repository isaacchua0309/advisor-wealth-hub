
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useClients } from "@/hooks/useClients";
import type { Policy } from "@/types/policy";

interface DeletePolicyDialogProps {
  policy: Policy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePolicyDialog({ policy, open, onOpenChange }: DeletePolicyDialogProps) {
  const { deletePolicy } = useClients();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePolicy.mutateAsync(policy.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting policy:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this policy?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the policy "{policy.policy_name}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
