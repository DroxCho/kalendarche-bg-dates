
-- Add length constraints on text fields to prevent abuse
ALTER TABLE public.birthdays ADD CONSTRAINT birthdays_name_length CHECK (char_length(name) <= 200);
ALTER TABLE public.recurring_events ADD CONSTRAINT recurring_events_name_length CHECK (char_length(name) <= 200);
ALTER TABLE public.calendar_notes ADD CONSTRAINT calendar_notes_text_length CHECK (char_length(text) <= 2000);
ALTER TABLE public.calendar_notes ADD CONSTRAINT calendar_notes_date_length CHECK (char_length(date) <= 20);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_url_length CHECK (char_length(avatar_url) <= 1000);
ALTER TABLE public.recurring_events ADD CONSTRAINT recurring_events_icon_length CHECK (char_length(icon) <= 50);
ALTER TABLE public.recurring_events ADD CONSTRAINT recurring_events_color_length CHECK (char_length(color) <= 50);
ALTER TABLE public.recurring_events ADD CONSTRAINT recurring_events_event_type_length CHECK (char_length(event_type) <= 50);
