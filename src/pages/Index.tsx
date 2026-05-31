import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BulgarianCalendar } from '@/components/BulgarianCalendar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, Settings, CalendarDays, Grid3X3 } from 'lucide-react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationToggle } from '@/components/NotificationToggle';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) {
        setAvatarUrl(null);
        return;
      }
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        } else if (user.user_metadata?.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    loadAvatar();
  }, [user]);

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 animate-fade-in">
          {/* Top controls row */}
          <div className="flex items-center justify-between gap-2 mb-4 print:hidden">
            <div className="flex flex-wrap items-center gap-1">
              <ThemeToggle />
              <NotificationToggle />
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="gap-1.5 h-8 text-xs px-2"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('calendar.month', 'Месец')}</span>
              </Button>
              <Button
                variant={viewMode === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('year')}
                className="gap-1.5 h-8 text-xs px-2"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('calendar.year', 'Година')}</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <LanguageToggle />
              {!loading && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-9 w-9 cursor-pointer border-2 border-border hover:border-primary transition-colors">
                        <AvatarImage
                          src={avatarUrl || user.user_metadata?.avatar_url}
                          alt={t('profile.avatar')}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{t('nav.myAccount')}</p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t('nav.profile')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('nav.settings')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('nav.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="gap-1.5"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('nav.login')}</span>
                  </Button>
                )
              )}
              <div id="export-print-portal" className="flex items-center gap-1" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
              {t('app.title')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t('app.subtitle')}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('app.description')}
            </p>
          </div>
        </header>


        {/* Calendar */}
        <main>
          <BulgarianCalendar viewMode={viewMode} setViewMode={setViewMode} />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>{t('app.copyright')}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
