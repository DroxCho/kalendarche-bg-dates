-- Create calendar_notes table
CREATE TABLE public.calendar_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create birthdays table
CREATE TABLE public.birthdays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_notes
CREATE POLICY "Users can view their own notes"
  ON public.calendar_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON public.calendar_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.calendar_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.calendar_notes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for birthdays
CREATE POLICY "Users can view their own birthdays"
  ON public.birthdays FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own birthdays"
  ON public.birthdays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own birthdays"
  ON public.birthdays FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own birthdays"
  ON public.birthdays FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_calendar_notes_user_date ON public.calendar_notes(user_id, date);
CREATE INDEX idx_birthdays_user ON public.birthdays(user_id);