import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">System and account configuration.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Profile</CardTitle>
          <CardDescription>Your admin account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value="admin@fastmedia.pro" disabled className="h-10" />
          </div>
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input placeholder="Admin" className="h-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground">Save</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Notifications</CardTitle>
          <CardDescription>Configure email notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">New Bookings</p>
              <p className="text-xs text-muted-foreground">Notify on every new enquiry.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Security Alerts</p>
              <p className="text-xs text-muted-foreground">Warn on suspicious activity.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
