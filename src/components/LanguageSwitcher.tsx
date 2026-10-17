import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  className?: string;
  triggerClassName?: string;
  showFlag?: boolean;
}

const LanguageSwitcher = ({ className, triggerClassName }: LanguageSwitcherProps = {}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn('inline-flex h-8 sm:h-9 items-center rounded-md border border-border bg-background/70 p-0.5', className)}
      role="group"
      aria-label={language === 'cs' ? 'Výběr jazyka' : language === 'de' ? 'Sprachauswahl' : 'Language selection'}
    >
      <Languages className="mx-1 sm:mx-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" aria-hidden="true" />
      {(['cs', 'en', 'de'] as const).map((option) => {
        const active = language === option;
        const label = option === 'cs' ? 'CZ' : option.toUpperCase();
        const accessibleLabel = option === 'cs' ? 'Čeština' : option === 'de' ? 'Deutsch' : 'British English';
        return (
          <Button
            variant="ghost"
            size="sm"
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            aria-label={accessibleLabel}
            aria-pressed={active}
            className={cn(
              'h-6 sm:h-7 min-w-8 sm:min-w-9 rounded px-1.5 sm:px-2 text-[11px] sm:text-xs font-semibold transition-colors',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              triggerClassName,
            )}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
