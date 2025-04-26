
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
import { Loader2 } from "lucide-react";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { GlobalPolicy } from "@/types/policy";

interface DeleteGlobalPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: GlobalPolicy;
}

export default function DeleteGlobalPolicyDialog({
  open,
  onOpenChange,
  policy,
}: DeleteGlobalPolicyDialogProps) {
  const { deleteGlobalPolicy } = useGlobalPolicies();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGlobalPolicy.mutateAsync(policy.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting global policy:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Global Policy</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the global policy "{policy.policy_name}"?
            <br /><br />
            This will remove this policy template from any client policies that use it.
            The client policies will not be deleted, but they will no longer be associated
            with this global policy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
