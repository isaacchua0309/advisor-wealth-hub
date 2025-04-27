
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Download,
  Trash,
  AlertTriangle,
} from "lucide-react";

export function AccountManagementSettings() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch all user data
      const [
        { data: clientsData, error: clientsError },
        { data: policiesData, error: policiesError },
        { data: tasksData, error: tasksError },
        { data: profileData, error: profileError },
      ] = await Promise.all([
        supabase.from('clients').select('*').eq('user_id', user.id),
        supabase.from('policies').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id),
      ]);
      
      if (clientsError || policiesError || tasksError || profileError) {
        throw new Error('Error fetching user data');
      }
      
      // Compile the data
      const exportData = {
        profile: profileData,
        clients: clientsData,
        policies: policiesData,
        tasks: tasksData,
        exportDate: new Date().toISOString(),
      };
      
      // Create JSON file and trigger download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const dataUrl = URL.createObjectURL(dataBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `account-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Export Complete",
        description: "Your account data has been exported successfully",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export account data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // The deletion process would involve:
      // 1. Delete all user data from Supabase tables (RLS would handle this)
      // 2. Delete user authentication account

      // Note: In a real implementation, you might want to make this a multi-step process
      // with additional verification or a deactivation period.
      
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      // Sign out the user
      await signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });
      
      // Redirect to login page (or home page)
      window.location.href = '/auth/login';
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Data Export</CardTitle>
          <CardDescription>
            Download a copy of your account data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            This will export all your clients, policies, tasks, and profile information as a JSON file.
          </p>
          <Button 
            onClick={handleExportData} 
            className="w-full sm:w-auto" 
            disabled={isExporting}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting Data..." : "Export My Data"}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" /> 
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                  <br /><br />
                  We recommend exporting your data before deletion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
