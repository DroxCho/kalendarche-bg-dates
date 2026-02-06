import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Palette, Globe, Monitor, Sun, Moon, Calendar, Clock } from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'bulgarian-calendar-app-settings';

interface AppSettings {
  calendarStartDay: 'monday' | 'sunday';
  dateFormat: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy';
  language: 'bg' | 'en';
}

const defaultSettings: AppSettings = {
  calendarStartDay: 'monday',
  dateFormat: 'dd.mm.yyyy',
  language: 'bg'
};

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = { ...defaultSettings, ...JSON.parse(stored) };
        setSettings(parsed);
      }
    } catch (e) {
      console.error('Failed to load app settings:', e);
    }
  }, []);

  // Save settings to localStorage and update i18n when language changes
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
        
        // Update i18n language when language setting changes
        if (key === 'language') {
          i18n.changeLanguage(value as string);
        }
      } catch (e) {
        console.error('Failed to save app settings:', e);
      }
      return newSettings;
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{t('settings.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>

        {/* Calendar Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('settings.calendar')}
            </CardTitle>
            <CardDescription>{t('settings.calendarDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDay">{t('settings.startDay')}</Label>
              <Select 
                value={settings.calendarStartDay} 
                onValueChange={(value: 'monday' | 'sunday') => updateSetting('calendarStartDay', value)}
              >
                <SelectTrigger id="startDay" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="monday">
                    <div className="flex items-center gap-2">
                      <span>{t('settings.monday')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sunday">
                    <div className="flex items-center gap-2">
                      <span>{t('settings.sunday')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.startDayDesc')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">{t('settings.dateFormat')}</Label>
              <Select 
                value={settings.dateFormat} 
                onValueChange={(value: AppSettings['dateFormat']) => updateSetting('dateFormat', value)}
              >
                <SelectTrigger id="dateFormat" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="dd.mm.yyyy">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{t('settings.dateFormatBG')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dd/mm/yyyy">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{t('settings.dateFormatSlash')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="yyyy-mm-dd">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{t('settings.dateFormatISO')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mm/dd/yyyy">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{t('settings.dateFormatUS')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.dateFormatDesc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('settings.theme')}
            </CardTitle>
            <CardDescription>{t('settings.themeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">{t('settings.colorTheme')}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>{t('settings.themeLight')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>{t('settings.themeDark')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>{t('settings.themeSystem')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.themeSystemDesc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>{t('settings.languageDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.appLanguage')}</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value: 'bg' | 'en') => updateSetting('language', value)}
              >
                <SelectTrigger id="language" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="bg">
                    <div className="flex items-center gap-2">
                      <span>🇧🇬</span>
                      <span>{t('settings.langBulgarian')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>{t('settings.langEnglish')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Back to Profile link */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/profile')}>
            {t('nav.backToProfile')} →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
