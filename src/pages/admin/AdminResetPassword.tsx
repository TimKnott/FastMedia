import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AdminResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check the URL hash for type=recovery (fallback)
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: 'Passwort zu kurz',
        description: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwörter stimmen nicht überein',
        description: 'Bitte stellen Sie sicher, dass beide Passwörter identisch sind.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Das Passwort konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Passwort aktualisiert',
      description: 'Ihr Passwort wurde erfolgreich geändert.',
    });
    navigate('/admin/login', { replace: true });
  };

  if (!isRecovery) {
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
                <KeyRound className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Ungültiger Link</CardTitle>
                <CardDescription className="mt-1">
                  Dieser Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                className="w-full h-11 gradient-primary text-primary-foreground"
                onClick={() => navigate('/admin/login')}
              >
                Zurück zur Anmeldung
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">Neues Passwort</CardTitle>
              <CardDescription className="mt-1">
                Geben Sie Ihr neues Passwort ein.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passwort wiederholen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 gradient-primary text-primary-foreground"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Speichern…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Passwort speichern
                  </span>
                )}
              </Button>
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

export default AdminResetPassword;
