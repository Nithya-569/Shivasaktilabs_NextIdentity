
CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  expertise text NOT NULL,
  category text NOT NULL DEFAULT 'Business',
  bio text,
  experience_years integer DEFAULT 0,
  availability text DEFAULT 'Weekends',
  contact_email text,
  contact_phone text,
  location text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentors are viewable by everyone" ON public.mentors FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can register as mentors" ON public.mentors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mentor profile" ON public.mentors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mentor profile" ON public.mentors FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
