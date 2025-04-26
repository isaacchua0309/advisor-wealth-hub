
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
import { Button } from "@/components/ui/button";
import { useGlobalPolicies } from "@/hooks/useGlobalPolicies";
import { GlobalPolicy } from "@/types/globalPolicy";
import { Loader2 } from "lucide-react";

interface DeleteGlobalPolicyDialogProps {
  policy: GlobalPolicy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGlobalPolicyDialog({
  policy,
  open,
  onOpenChange
}: DeleteGlobalPolicyDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteGlobalPolicy } = useGlobalPolicies();
  
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
          <AlertDialogTitle>Are you sure you want to delete this policy?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the "{policy.policy_name}" policy from your global policy list. 
            This action cannot be undone, but it won't affect any client policies that have already been created using this global policy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Policy"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
