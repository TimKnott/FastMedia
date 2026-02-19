import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  triggerClassName?: string;
  showFlag?: boolean;
}

const languages = [
  { code: 'cs' as const, label: 'Čeština', flag: '🇨🇿' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSwitcher = ({ className, triggerClassName, showFlag = true }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn('gap-2', triggerClassName)}>
          <Globe className="w-4 h-4" />
          {showFlag && (
            <span>{languages.find((l) => l.code === language)?.flag}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={className}>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-accent/10' : ''}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
