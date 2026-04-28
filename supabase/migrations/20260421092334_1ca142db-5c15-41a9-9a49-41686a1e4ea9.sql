-- 1. Add privacy controls to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS hide_location boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_personal_story boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_messages boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- 2. Replace public SELECT policy on profiles to honor is_public
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles or own profile viewable"
ON public.profiles
FOR SELECT
USING (
  is_public = true
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Update conversations INSERT to respect recipient's allow_messages
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;

CREATE POLICY "Users can insert conversations if recipient allows"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = participant_one OR auth.uid() = participant_two)
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = CASE
      WHEN auth.uid() = participant_one THEN participant_two
      ELSE participant_one
    END
    AND p.allow_messages = true
  )
);

-- 4. Community chat messages table (group chat per community)
CREATE TABLE IF NOT EXISTS public.community_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_chat_messages_community
  ON public.community_chat_messages(community_id, created_at DESC);

ALTER TABLE public.community_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read community chat"
ON public.community_chat_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can post to community chat"
ON public.community_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own community chat messages"
ON public.community_chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any community chat message"
ON public.community_chat_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Enable realtime on community chat
ALTER TABLE public.community_chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_chat_messages;