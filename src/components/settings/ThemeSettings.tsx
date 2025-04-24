
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeSettings() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<string>("light");
  const [isSaving, setIsSaving] = useState(false);
  
  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);
  
  const saveThemeSettings = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      
      toast({
        title: "Theme updated",
        description: `Application theme has been set to ${theme} mode`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleThemeChange = (value: string) => {
    if (value) setTheme(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Preferences</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Color Theme</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start">
                <ToggleGroup type="single" value={theme} onValueChange={handleThemeChange} className="justify-center">
                  <ToggleGroupItem value="light" aria-label="Light mode" className="px-4 py-2 data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900">
                    <Sun className="mr-2 h-5 w-5" />
                    Light
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" aria-label="Dark mode" className="px-4 py-2 data-[state=on]:bg-blue-100 dark:data-[state=on]:bg-blue-900">
                    <Moon className="mr-2 h-5 w-5" />
                    Dark
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
              <h3 className="text-lg font-medium mb-2">Theme Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`bg-background p-4 rounded-md border shadow-sm transition-colors ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}>
                  <p className="font-medium">Light Theme</p>
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                  </div>
                </div>
                
                <div className={`bg-gray-900 text-white p-4 rounded-md border border-gray-700 shadow-sm transition-colors ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}>
                  <p className="font-medium">Dark Theme</p>
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-700"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-700"></div>
                    <div className="h-4 w-5/6 rounded bg-gray-700"></div>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={saveThemeSettings} className="w-full mt-4" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Theme Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
