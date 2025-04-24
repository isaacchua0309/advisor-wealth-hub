
export default function Settings() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <p className="text-muted-foreground mb-6">
        Customize your account and application preferences.
      </p>
      
      <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Account Settings</h3>
          <p className="text-muted-foreground">Profile, notification settings, and app preferences will be managed here.</p>
        </div>
      </div>
    </div>
  );
}
