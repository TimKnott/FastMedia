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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
    });
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setIsRecovery(true);
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please ensure both passwords are identical.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Could not update password. Please try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
    navigate('/admin/login', { replace: true });
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
                <KeyRound className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Invalid Link</CardTitle>
                <CardDescription className="mt-1">This password reset link is invalid or has expired.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Button className="w-full h-11 gradient-primary text-primary-foreground" onClick={() => navigate('/admin/login')}>Back to Login</Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-elegant">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-display">New Password</CardTitle>
              <CardDescription className="mt-1">Enter your new password.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11 gradient-primary text-primary-foreground" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Saving…</span>
                ) : (
                  <span className="flex items-center gap-2"><Check className="w-4 h-4" />Save Password</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-primary-foreground/60 mt-6">FastMedia.Pro &middot; Admin Back-Office</p>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
