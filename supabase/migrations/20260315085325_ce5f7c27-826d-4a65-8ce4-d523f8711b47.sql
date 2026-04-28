
CREATE TABLE public.map_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('business', 'training_center', 'ngo')),
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Map locations are viewable by everyone"
  ON public.map_locations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert map locations"
  ON public.map_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own map locations"
  ON public.map_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own map locations"
  ON public.map_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_map_locations_updated_at
  BEFORE UPDATE ON public.map_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.map_locations;
