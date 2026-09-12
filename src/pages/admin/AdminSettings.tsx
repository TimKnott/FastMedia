import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSetting } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [userEmail, setUserEmail] = useState('');
  const [savingPricing, setSavingPricing] = useState(false);
  const { enabled: showPricing, loading: pricingLoading, update: updatePricing } = useSiteSetting('show_pricing');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

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
            <Input value={userEmail} disabled className="h-10" />
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
          <CardTitle className="text-lg font-display">Public website sections</CardTitle>
          <CardDescription>Show or hide sections on the public website.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Price list (Prices)</p>
              <p className="text-xs text-muted-foreground">
                When off, the pricing section and its menu link are hidden from visitors. Off by default.
              </p>
            </div>
            <Switch
              checked={showPricing}
              disabled={pricingLoading || savingPricing}
              onCheckedChange={async (value) => {
                setSavingPricing(true);
                const error = await updatePricing(value);
                setSavingPricing(false);
                if (error) toast.error('Could not save. You need admin rights.');
                else toast.success(value ? 'Price list is now visible.' : 'Price list is now hidden.');
              }}
              aria-label="Show price list"
            />
          </div>
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
