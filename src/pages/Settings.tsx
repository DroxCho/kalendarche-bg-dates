import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Palette, Globe, Monitor, Sun, Moon } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

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
