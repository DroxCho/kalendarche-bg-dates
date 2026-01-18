import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Mail, Lock, LogOut, Trash2, Download, Database, Bell, Upload } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Notification preferences
  const [emailReminders, setEmailReminders] = useState(true);
  const [emailRecurringReminders, setEmailRecurringReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState('1');
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setEmailReminders(data.email_birthday_reminders);
          setEmailRecurringReminders(data.email_recurring_reminders ?? true);
          setReminderDays(String(data.reminder_days_before));
        }
      } catch (error: any) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoadingPrefs(false);
      }
    };

    if (user) {
      loadPreferences();
    }
  }, [user]);

  const saveNotificationPreferences = async (updates: {
    emailBirthday?: boolean;
    emailRecurring?: boolean;
    days?: string;
  }) => {
    if (!user) return;
    
    setSavingPrefs(true);
    try {
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const updateData: Record<string, unknown> = {};
      if (updates.emailBirthday !== undefined) updateData.email_birthday_reminders = updates.emailBirthday;
      if (updates.emailRecurring !== undefined) updateData.email_recurring_reminders = updates.emailRecurring;
      if (updates.days !== undefined) updateData.reminder_days_before = parseInt(updates.days);

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(updateData)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_birthday_reminders: updates.emailBirthday ?? emailReminders,
            email_recurring_reminders: updates.emailRecurring ?? emailRecurringReminders,
            reminder_days_before: parseInt(updates.days ?? reminderDays),
          });
        
        if (error) throw error;
      }

      toast({ title: 'Успех!', description: 'Настройките са запазени.' });
    } catch (error: any) {
      toast({ title: 'Грешка', description: error.message, variant: 'destructive' });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleEmailRemindersChange = (checked: boolean) => {
    setEmailReminders(checked);
    saveNotificationPreferences({ emailBirthday: checked });
  };

  const handleEmailRecurringRemindersChange = (checked: boolean) => {
    setEmailRecurringReminders(checked);
    saveNotificationPreferences({ emailRecurring: checked });
  };

  const handleReminderDaysChange = (value: string) => {
    setReminderDays(value);
    saveNotificationPreferences({ days: value });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ title: 'Грешка', description: 'Паролите не съвпадат.', variant: 'destructive' });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ title: 'Грешка', description: 'Паролата трябва да е поне 6 символа.', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast({ title: 'Успех!', description: 'Паролата е променена успешно.' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Грешка', description: error.message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleExportData = async () => {
    if (!user) return;
    
    setExporting(true);
    try {
      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('calendar_notes')
        .select('*')
        .eq('user_id', user.id);
      
      if (notesError) throw notesError;

      // Fetch birthdays
      const { data: birthdaysData, error: birthdaysError } = await supabase
        .from('birthdays')
        .select('*')
        .eq('user_id', user.id);
      
      if (birthdaysError) throw birthdaysError;

      // Fetch recurring events
      const { data: recurringEventsData, error: recurringEventsError } = await supabase
        .from('recurring_events')
        .select('*')
        .eq('user_id', user.id);
      
      if (recurringEventsError) throw recurringEventsError;

      const exportData = {
        exportedAt: new Date().toISOString(),
        email: user.email,
        notes: notesData || [],
        birthdays: birthdaysData || [],
        recurringEvents: recurringEventsData || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kalendar-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ 
        title: 'Успех!', 
        description: `Експортирани ${notesData?.length || 0} бележки, ${birthdaysData?.length || 0} рождени дни и ${recurringEventsData?.length || 0} събития.` 
      });
    } catch (error: any) {
      toast({ title: 'Грешка', description: error.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.notes && !data.birthdays && !data.recurringEvents) {
        throw new Error('Невалиден формат на файла. Липсват данни за бележки, рождени дни или събития.');
      }

      let notesImported = 0;
      let birthdaysImported = 0;
      let eventsImported = 0;
      let notesSkipped = 0;
      let birthdaysSkipped = 0;
      let eventsSkipped = 0;

      // Import notes
      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          // Check if note already exists (same date and text)
          const { data: existing } = await supabase
            .from('calendar_notes')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', note.date)
            .eq('text', note.text)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase
              .from('calendar_notes')
              .insert({
                user_id: user.id,
                date: note.date,
                text: note.text,
              });
            
            if (!error) {
              notesImported++;
            }
          } else {
            notesSkipped++;
          }
        }
      }

      // Import birthdays
      if (data.birthdays && Array.isArray(data.birthdays)) {
        for (const birthday of data.birthdays) {
          // Check if birthday already exists (same name, month, day)
          const { data: existing } = await supabase
            .from('birthdays')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', birthday.name)
            .eq('month', birthday.month)
            .eq('day', birthday.day)
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase
              .from('birthdays')
              .insert({
                user_id: user.id,
                name: birthday.name,
                month: birthday.month,
                day: birthday.day,
                year: birthday.year || null,
              });
            
            if (!error) {
              birthdaysImported++;
            }
          } else {
            birthdaysSkipped++;
          }
        }
      }

      // Import recurring events
      if (data.recurringEvents && Array.isArray(data.recurringEvents)) {
        for (const event of data.recurringEvents) {
          // Check if event already exists (same name, month, day, event_type)
          const { data: existing } = await supabase
            .from('recurring_events')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', event.name)
            .eq('month', event.month)
            .eq('day', event.day)
            .eq('event_type', event.event_type || 'anniversary')
            .maybeSingle();

          if (!existing) {
            const { error } = await supabase
              .from('recurring_events')
              .insert({
                user_id: user.id,
                name: event.name,
                month: event.month,
                day: event.day,
                year: event.year || null,
                event_type: event.event_type || 'anniversary',
                icon: event.icon || 'heart',
                color: event.color || 'purple',
              });
            
            if (!error) {
              eventsImported++;
            }
          } else {
            eventsSkipped++;
          }
        }
      }

      const totalSkipped = notesSkipped + birthdaysSkipped + eventsSkipped;
      const skippedMessage = totalSkipped > 0 
        ? ` (${totalSkipped} дублирани записи пропуснати)`
        : '';

      toast({ 
        title: 'Успех!', 
        description: `Импортирани ${notesImported} бележки, ${birthdaysImported} рождени дни и ${eventsImported} събития${skippedMessage}.` 
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({ 
        title: 'Грешка при импортиране', 
        description: error.message || 'Неуспешно импортиране на данните.', 
        variant: 'destructive' 
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Зареждане...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Профил</h1>
            <p className="text-sm text-muted-foreground">Управление на акаунта</p>
          </div>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Информация за акаунта
            </CardTitle>
            <CardDescription>Основни данни за вашия профил</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Имейл адрес
              </Label>
              <Input value={user.email || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Регистриран на</Label>
              <Input 
                value={user.created_at ? new Date(user.created_at).toLocaleDateString('bg-BG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : ''} 
                disabled 
                className="bg-muted" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Промяна на парола
            </CardTitle>
            <CardDescription>Задайте нова парола за вашия акаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Нова парола</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Потвърдете паролата</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <Button type="submit" disabled={changingPassword || !newPassword || !confirmPassword}>
                {changingPassword ? 'Промяна...' : 'Промени паролата'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Имейл напомняния
            </CardTitle>
            <CardDescription>Получавайте имейл напомняния за предстоящи събития</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Рождени дни</Label>
                <p className="text-sm text-muted-foreground">
                  Получавайте известия за предстоящи рождени дни
                </p>
              </div>
              <Switch
                checked={emailReminders}
                onCheckedChange={handleEmailRemindersChange}
                disabled={loadingPrefs || savingPrefs}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Годишнини и събития</Label>
                <p className="text-sm text-muted-foreground">
                  Получавайте известия за годишнини и други повтарящи се събития
                </p>
              </div>
              <Switch
                checked={emailRecurringReminders}
                onCheckedChange={handleEmailRecurringRemindersChange}
                disabled={loadingPrefs || savingPrefs}
              />
            </div>
            
            {(emailReminders || emailRecurringReminders) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Напомни ме</Label>
                  <Select value={reminderDays} onValueChange={handleReminderDaysChange} disabled={loadingPrefs || savingPrefs}>
                    <SelectTrigger>
                      <SelectValue placeholder="Изберете..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">В деня на събитието</SelectItem>
                      <SelectItem value="1">1 ден преди</SelectItem>
                      <SelectItem value="2">2 дни преди</SelectItem>
                      <SelectItem value="3">3 дни преди</SelectItem>
                      <SelectItem value="7">1 седмица преди</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Управление на данни
            </CardTitle>
            <CardDescription>Експортирайте или импортирайте вашите бележки и рождени дни</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2" 
              onClick={handleExportData}
              disabled={exporting || importing}
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Експортиране...' : 'Експортирай всички данни (JSON)'}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                disabled={importing || exporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 pointer-events-none"
                disabled={importing || exporting}
              >
                <Upload className="h-4 w-4" />
                {importing ? 'Импортиране...' : 'Импортирай от файл (JSON)'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Импортирането няма да презапише съществуващи записи. Дублираните записи ще бъдат пропуснати.
            </p>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Изход от профила
            </Button>
            
            <Separator />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start gap-2">
                  <Trash2 className="h-4 w-4" />
                  Изтриване на акаунта
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Това действие е необратимо. Вашият акаунт и всички свързани данни ще бъдат изтрити завинаги.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отказ</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      toast({ 
                        title: 'Информация', 
                        description: 'За изтриване на акаунта, моля свържете се с администратор.' 
                      });
                    }}
                  >
                    Изтрий
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
