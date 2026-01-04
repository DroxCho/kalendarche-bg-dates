import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHolidayNotifications } from '@/hooks/useHolidayNotifications';
import { cn } from '@/lib/utils';

export function NotificationToggle() {
  const { notificationsEnabled, toggleNotifications, isSupported, permission } = useHolidayNotifications();

  if (!isSupported) return null;

  const getTooltipText = () => {
    if (permission === 'denied') {
      return 'Известията са блокирани в браузъра';
    }
    return notificationsEnabled 
      ? 'Изключи известията за празници' 
      : 'Включи известия за предстоящи празници';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={notificationsEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={toggleNotifications}
            disabled={permission === 'denied'}
            className={cn(
              "gap-1.5",
              permission === 'denied' && "opacity-50 cursor-not-allowed"
            )}
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {notificationsEnabled ? 'Известия вкл.' : 'Известия'}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
