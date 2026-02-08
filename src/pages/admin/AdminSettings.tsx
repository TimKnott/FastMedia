import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground mt-1">System- und Kontokonfiguration.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Profil</CardTitle>
          <CardDescription>Ihre Admin-Kontoinformationen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-Mail</Label>
            <Input value="admin@fastmedia.pro" disabled className="h-10" />
          </div>
          <div className="space-y-2">
            <Label>Anzeigename</Label>
            <Input placeholder="Admin" className="h-10" />
          </div>
          <Button className="gradient-primary text-primary-foreground">Speichern</Button>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-display">Benachrichtigungen</CardTitle>
          <CardDescription>E-Mail-Benachrichtigungen konfigurieren.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Neue Buchungen</p>
              <p className="text-xs text-muted-foreground">Bei jeder neuen Anfrage benachrichtigen.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sicherheitswarnungen</p>
              <p className="text-xs text-muted-foreground">Bei verdächtigen Aktivitäten warnen.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
