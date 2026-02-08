import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace with Supabase auth when Cloud is enabled
    // For now, navigate to dashboard for UI development
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Anmeldung erfolgreich',
        description: 'Willkommen im Admin-Bereich.',
      });
      navigate('/admin');
    }, 800);
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
