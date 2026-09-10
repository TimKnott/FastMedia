import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  triggerClassName?: string;
  showFlag?: boolean;
}

const LanguageSwitcher = ({ className, triggerClassName }: LanguageSwitcherProps = {}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn('inline-flex h-9 items-center rounded-md border border-border bg-background/70 p-0.5', className)}
      role="group"
      aria-label={language === 'cs' ? 'Výběr jazyka' : 'Language selection'}
    >
      <Languages className="mx-1.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      {(['cs', 'en'] as const).map((option) => {
        const active = language === option;
        const label = option === 'cs' ? 'CZ' : 'EN';
        const accessibleLabel = option === 'cs' ? 'Čeština' : 'British English';
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            aria-label={accessibleLabel}
            aria-pressed={active}
            className={cn(
              'h-7 min-w-9 rounded px-2 text-xs font-semibold transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              triggerClassName,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
