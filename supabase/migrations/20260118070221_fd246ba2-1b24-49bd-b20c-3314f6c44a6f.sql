-- Add email reminder preference for recurring events
ALTER TABLE public.notification_preferences 
ADD COLUMN IF NOT EXISTS email_recurring_reminders boolean NOT NULL DEFAULT true;