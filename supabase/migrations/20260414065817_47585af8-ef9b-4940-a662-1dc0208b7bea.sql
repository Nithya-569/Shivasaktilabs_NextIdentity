
CREATE TABLE public.anonymous_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  emoji text DEFAULT '💜',
  support_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.anonymous_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read anonymous posts"
  ON public.anonymous_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create anonymous posts"
  ON public.anonymous_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own anonymous posts"
  ON public.anonymous_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.anonymous_post_supports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.anonymous_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.anonymous_post_supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read supports"
  ON public.anonymous_post_supports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add support"
  ON public.anonymous_post_supports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove support"
  ON public.anonymous_post_supports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_posts;
