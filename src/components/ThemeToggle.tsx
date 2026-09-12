import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  /** Use on dark footer/hero surfaces where foreground tokens are inverted. */
  variant?: 'default' | 'inverted';
}

const ThemeToggle = ({ className, variant = 'default' }: ThemeToggleProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { language } = useLanguage();
  const isEnglish = language === 'en';
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = isDark
    ? isEnglish
      ? 'Switch to light mode'
      : 'Přepnout na světlý režim'
    : isEnglish
      ? 'Switch to dark mode'
      : 'Přepnout na tmavý režim';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border transition-colors',
        variant === 'inverted'
          ? 'border-background/20 bg-background/10 hover:bg-background/20'
          : 'border-border bg-muted hover:bg-muted/70',
        className,
      )}
    >
      <span
        className={cn(
          'absolute flex h-7 w-7 items-center justify-center rounded-full shadow-sm transition-transform duration-300',
          isDark ? 'translate-x-8' : 'translate-x-1',
          'bg-card text-foreground',
        )}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
      <Sun
        className={cn(
          'pointer-events-none absolute left-2 h-3.5 w-3.5 transition-opacity',
          variant === 'inverted' ? 'text-background/70' : 'text-muted-foreground',
          isDark ? 'opacity-70' : 'opacity-0',
        )}
      />
      <Moon
        className={cn(
          'pointer-events-none absolute right-2 h-3.5 w-3.5 transition-opacity',
          variant === 'inverted' ? 'text-background/70' : 'text-muted-foreground',
          isDark ? 'opacity-0' : 'opacity-70',
        )}
      />
    </button>
  );
};

export default ThemeToggle;
