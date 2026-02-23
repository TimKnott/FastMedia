import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, LogIn, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);

    await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setResetLoading(false);
    setResetOpen(false);
    setResetEmail('');
    toast({
      title: 'E-Mail gesendet',
      description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.',
    });
  };

  // Redirect if already authenticated as admin
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (data) navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoading(false);
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: 'E-Mail oder Passwort ungültig. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
      return;
    }

    // Verify admin role
    if (data.user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        await supabase.auth.signOut();
        setLoading(false);
        toast({
          title: 'Zugriff verweigert',
          description: 'Sie haben keine Administratorrechte.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(false);
    toast({
      title: 'Anmeldung erfolgreich',
      description: 'Willkommen im Admin-Bereich.',
    });
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">Admin-Portal</CardTitle>
              <CardDescription className="mt-1">
                Melden Sie sich an, um das Back-Office zu verwalten.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@fastmedia.pro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 gradient-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Anmelden…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Anmelden
                  </span>
                )}
              </Button>

              <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    Passwort vergessen?
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Passwort zurücksetzen</DialogTitle>
                    <DialogDescription>
                      Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">E-Mail-Adresse</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="admin@fastmedia.pro"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        autoComplete="email"
                        className="h-11"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 gradient-primary text-primary-foreground"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Senden…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Link senden
                        </span>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-primary-foreground/60 mt-6">
          FastMedia.Pro &middot; Admin Back-Office
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
