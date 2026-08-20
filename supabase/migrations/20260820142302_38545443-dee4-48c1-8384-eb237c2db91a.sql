CREATE TABLE public.custom_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description text CHECK (description IS NULL OR char_length(description) <= 2000),
  start_date date NOT NULL,
  end_date date NOT NULL,
  all_day boolean NOT NULL DEFAULT true,
  start_time time,
  end_time time,
  color text NOT NULL DEFAULT 'blue' CHECK (color IN ('blue','purple','green','orange','pink','red')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_events_date_order CHECK (end_date >= start_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_events TO authenticated;
GRANT ALL ON public.custom_events TO service_role;

ALTER TABLE public.custom_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom events" ON public.custom_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own custom events" ON public.custom_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom events" ON public.custom_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom events" ON public.custom_events FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX custom_events_user_range_idx ON public.custom_events (user_id, start_date, end_date);

CREATE TRIGGER update_custom_events_updated_at
BEFORE UPDATE ON public.custom_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();