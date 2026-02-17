import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const toggleLanguage = () => {
    i18n.changeLanguage(isEnglish ? 'bg' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-1.5"
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{isEnglish ? 'БГ' : 'EN'}</span>
    </Button>
  );
}
