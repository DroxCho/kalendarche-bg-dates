import { useNavigate } from 'react-router-dom';
import { BulgarianCalendar } from '@/components/BulgarianCalendar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="relative text-center mb-8 animate-fade-in">
          {/* Profile buttons - top right */}
          <div className="absolute right-0 top-0 flex items-center gap-1 print:hidden">
            {!loading && (
              user ? (
                <>
                  <Avatar 
                    className="h-8 w-8 cursor-pointer border border-border"
                    onClick={() => navigate('/profile')}
                  >
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url} 
                      alt="Профилна снимка" 
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="gap-1.5"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Профил</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="gap-1.5"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Изход</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Вход</span>
                </Button>
              )
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
            Български календар
          </h1>
          <p className="text-lg text-muted-foreground">
            Декември 2025 – Януари 2027
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Национални, православни и неработни дни
          </p>
        </header>

        {/* Calendar */}
        <main>
          <BulgarianCalendar />
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© 2025 Български календар</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
