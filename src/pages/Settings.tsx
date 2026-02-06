import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Palette, Globe, Monitor, Sun, Moon, Calendar, Clock } from 'lucide-react';

const SETTINGS_STORAGE_KEY = 'bulgarian-calendar-app-settings';

interface AppSettings {
  calendarStartDay: 'monday' | 'sunday';
  dateFormat: 'dd.mm.yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd' | 'mm/dd/yyyy';
}

const defaultSettings: AppSettings = {
  calendarStartDay: 'monday',
  dateFormat: 'dd.mm.yyyy'
};

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load app settings:', e);
    }
  }, []);

  // Save settings to localStorage
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
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
            <h1 className="text-2xl font-display font-bold text-foreground">Настройки</h1>
            <p className="text-sm text-muted-foreground">Предпочитания на приложението</p>
          </div>
        </div>

        {/* Calendar Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Календар
            </CardTitle>
            <CardDescription>Настройки за показване на календара</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDay">Начален ден на седмицата</Label>
              <Select 
                value={settings.calendarStartDay} 
                onValueChange={(value: 'monday' | 'sunday') => updateSetting('calendarStartDay', value)}
              >
                <SelectTrigger id="startDay" className="w-full">
                  <SelectValue placeholder="Изберете ден" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="monday">
                    <div className="flex items-center gap-2">
                      <span>Понеделник</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sunday">
                    <div className="flex items-center gap-2">
                      <span>Неделя</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Изберете кой ден да бъде първи в седмичния изглед.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Формат на датата</Label>
              <Select 
                value={settings.dateFormat} 
                onValueChange={(value: AppSettings['dateFormat']) => updateSetting('dateFormat', value)}
              >
                <SelectTrigger id="dateFormat" className="w-full">
                  <SelectValue placeholder="Изберете формат" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="dd.mm.yyyy">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>31.12.2024 (БГ стандарт)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dd/mm/yyyy">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>31/12/2024</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="yyyy-mm-dd">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>2024-12-31 (ISO)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mm/dd/yyyy">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>12/31/2024 (US)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Форматът ще се използва при показване на дати в приложението.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Тема
            </CardTitle>
            <CardDescription>Изберете как изглежда приложението</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Цветова тема</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme" className="w-full">
                  <SelectValue placeholder="Изберете тема" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Светла</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Тъмна</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>Системна</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Системната тема следва настройките на вашето устройство.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Език
            </CardTitle>
            <CardDescription>Изберете език на интерфейса</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Език на приложението</Label>
              <Select defaultValue="bg">
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Изберете език" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border">
                  <SelectItem value="bg">
                    <div className="flex items-center gap-2">
                      <span>🇧🇬</span>
                      <span>Български</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en" disabled>
                    <div className="flex items-center gap-2">
                      <span>🇬🇧</span>
                      <span>English (скоро)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Допълнителни езици ще бъдат добавени скоро.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Profile link */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/profile')}>
            Към настройки на профила →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
