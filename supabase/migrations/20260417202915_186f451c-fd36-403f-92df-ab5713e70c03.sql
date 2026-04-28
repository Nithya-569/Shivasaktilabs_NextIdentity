-- Replies table for anonymous posts
CREATE TABLE public.anonymous_post_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.anonymous_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  emoji TEXT DEFAULT '💜',
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  moderation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.anonymous_post_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read replies"
  ON public.anonymous_post_replies FOR SELECT
  TO authenticated USING (is_flagged = false OR auth.uid() = user_id);

CREATE POLICY "Users can create replies"
  ON public.anonymous_post_replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies"
  ON public.anonymous_post_replies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any reply"
  ON public.anonymous_post_replies FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add moderation columns to anonymous_posts
ALTER TABLE public.anonymous_posts
  ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

CREATE INDEX idx_anon_replies_post ON public.anonymous_post_replies(post_id, created_at DESC);