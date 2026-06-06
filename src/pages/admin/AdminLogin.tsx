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
import { lovable } from '@/integrations/lovable';
import { hasMinimumRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Self-healing role check: auto-grants super_admin to allowlisted emails
  const verifyAndRoute = async (userId: string): Promise<boolean> => {
    await supabase.rpc('ensure_admin_role');

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const roles = (roleData ?? []).map((r) => r.role);
    const highest =
      roles.includes('super_admin') ? 'super_admin' :
      roles.includes('admin') ? 'admin' :
      roles.includes('moderator') ? 'moderator' :
      roles.includes('editor') ? 'editor' : null;

    if (!highest || !hasMinimumRole(highest as any, 'editor')) {
      await supabase.auth.signOut();
      toast({
        title: 'Access denied',
        description: 'You do not have administrator privileges.',
        variant: 'destructive',
      });
      return false;
    }
    navigate('/admin', { replace: true });
    return true;
  };

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
      title: 'Email sent',
      description: 'If an account exists with that email, you will receive a reset link.',
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await verifyAndRoute(session.user.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/admin/login`,
      });
      if (result.error) {
        toast({ title: 'Google sign-in failed', description: result.error.message ?? 'Please try again.', variant: 'destructive' });
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return;
      const { data } = await supabase.auth.getUser();
      if (data.user) await verifyAndRoute(data.user.id);
    } catch (err: any) {
      toast({ title: 'Google sign-in failed', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

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
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (data.user) {
      const ok = await verifyAndRoute(data.user.id);
      setLoading(false);
      if (ok) {
        toast({ title: 'Login successful', description: 'Welcome to the admin area.' });
      }
      return;
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4 relative">
      {/* Language switcher + Home link in top-right */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <LanguageSwitcher triggerClassName="text-primary-foreground/80 hover:text-primary-foreground" />
      </div>

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
              <CardTitle className="text-2xl font-display">{t('admin.portal')}</CardTitle>
              <CardDescription className="mt-1">
                {t('admin.sign_in_desc')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-5">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Connecting to Google…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                  </svg>
                  Continue with Google
                </span>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              <div className="space-y-2">
                <Label htmlFor="email">{t('admin.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('admin.password')}</Label>
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
                    …
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    {t('admin.sign_in')}
                  </span>
                )}
              </Button>

              <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    {t('admin.forgot_password')}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('admin.reset_password')}</DialogTitle>
                    <DialogDescription>
                      {t('admin.reset_desc')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">{t('admin.email')}</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="admin@example.com"
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
                          …
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {t('admin.send_link')}
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
          FastMedia.Pro &middot; {t('admin.backoffice')}
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
