-- Create table for recurring events (anniversaries, etc.)
CREATE TABLE public.recurring_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  year INTEGER,
  event_type TEXT NOT NULL DEFAULT 'anniversary' CHECK (event_type IN ('anniversary', 'memorial', 'custom')),
  icon TEXT DEFAULT 'heart',
  color TEXT DEFAULT 'purple',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recurring_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own recurring events" 
ON public.recurring_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring events" 
ON public.recurring_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring events" 
ON public.recurring_events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring events" 
ON public.recurring_events 
FOR DELETE 
USING (auth.uid() = user_id);