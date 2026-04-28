-- ============================================================
-- TransConnect India — Missing Tables Migration
-- Run this entire script in your Supabase SQL editor.
-- Safe to run: only creates tables that don't exist yet.
-- ============================================================

-- ─────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text,
  preferred_pronouns text,
  location      text,
  skills        text[],
  education     text,
  work_interests text[],
  personal_story text,
  avatar_url    text,
  is_public     boolean not null default true,
  hide_location boolean not null default false,
  hide_personal_story boolean not null default false,
  allow_messages boolean not null default true,
  is_verified   boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (user_id)
);

alter table public.profiles enable row level security;

-- Anyone can view public profiles
create policy if not exists "Public profiles are viewable by all"
  on public.profiles for select
  using (is_public = true or auth.uid() = user_id);

-- Users can insert their own profile
create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- Users can update their own profile
create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 2. JOBS
-- ─────────────────────────────────────────
create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  company     text not null,
  location    text not null,
  type        text not null default 'Full-time',
  category    text not null default 'Corporate',
  description text,
  verified    boolean not null default false,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy if not exists "Anyone can view jobs"
  on public.jobs for select using (true);

create policy if not exists "Authenticated users can insert jobs"
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own jobs"
  on public.jobs for delete
  using (auth.uid() = user_id);

create policy if not exists "Admins can update jobs"
  on public.jobs for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 3. MENTORS
-- ─────────────────────────────────────────
create table if not exists public.mentors (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  expertise        text not null,
  category         text not null default 'Business',
  bio              text,
  experience_years integer not null default 0,
  availability     text not null default 'Weekends',
  contact_email    text,
  contact_phone    text,
  location         text,
  is_verified      boolean not null default false,
  created_at       timestamptz not null default now()
);

alter table public.mentors enable row level security;

create policy if not exists "Anyone can view mentors"
  on public.mentors for select using (true);

create policy if not exists "Authenticated users can insert mentors"
  on public.mentors for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own mentor listing"
  on public.mentors for delete
  using (auth.uid() = user_id);

create policy if not exists "Admins can update mentors"
  on public.mentors for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 4. MAP LOCATIONS
-- ─────────────────────────────────────────
create table if not exists public.map_locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  category    text not null default 'business',
  address     text not null,
  latitude    double precision not null,
  longitude   double precision not null,
  phone       text,
  website     text,
  created_at  timestamptz not null default now()
);

alter table public.map_locations enable row level security;

create policy if not exists "Anyone can view map locations"
  on public.map_locations for select using (true);

create policy if not exists "Authenticated users can insert locations"
  on public.map_locations for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own locations"
  on public.map_locations for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 5. MOOD ENTRIES
-- ─────────────────────────────────────────
create table if not exists public.mood_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mood       text not null,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.mood_entries enable row level security;

create policy if not exists "Users can manage their own mood entries"
  on public.mood_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 6. COMMUNITIES
-- ─────────────────────────────────────────
create table if not exists public.communities (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  category    text not null default 'General',
  emoji       text not null default '👥',
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.communities enable row level security;

create policy if not exists "Anyone can view communities"
  on public.communities for select using (true);

create policy if not exists "Authenticated users can create communities"
  on public.communities for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own communities"
  on public.communities for delete
  using (auth.uid() = user_id);

create policy if not exists "Admins can update communities"
  on public.communities for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 7. COMMUNITY MEMBERS
-- ─────────────────────────────────────────
create table if not exists public.community_members (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (community_id, user_id)
);

alter table public.community_members enable row level security;

create policy if not exists "Users can manage their own memberships"
  on public.community_members for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Anyone can view community members"
  on public.community_members for select using (true);

-- ─────────────────────────────────────────
-- 8. COMMUNITY CHAT MESSAGES
-- ─────────────────────────────────────────
create table if not exists public.community_chat_messages (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  created_at   timestamptz not null default now()
);

alter table public.community_chat_messages enable row level security;

create policy if not exists "Anyone can view community chat messages"
  on public.community_chat_messages for select using (true);

create policy if not exists "Authenticated users can post messages"
  on public.community_chat_messages for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own messages"
  on public.community_chat_messages for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 9. CONVERSATIONS (Direct Messages)
-- ─────────────────────────────────────────
create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  participant_one uuid not null references auth.users(id) on delete cascade,
  participant_two uuid not null references auth.users(id) on delete cascade,
  updated_at      timestamptz not null default now(),
  unique (participant_one, participant_two)
);

alter table public.conversations enable row level security;

create policy if not exists "Participants can view their conversations"
  on public.conversations for select
  using (auth.uid() = participant_one or auth.uid() = participant_two);

create policy if not exists "Authenticated users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = participant_one or auth.uid() = participant_two);

create policy if not exists "Participants can update their conversations"
  on public.conversations for update
  using (auth.uid() = participant_one or auth.uid() = participant_two);

-- ─────────────────────────────────────────
-- 10. MESSAGES (DM messages)
-- ─────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy if not exists "Conversation participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

create policy if not exists "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy if not exists "Participants can update read status"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- ─────────────────────────────────────────
-- 11. EVENTS
-- ─────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  type        text not null default 'Workshop',
  event_date  date not null,
  start_time  text,
  end_time    text,
  location    text not null,
  capacity    integer not null default 50,
  organizer   text not null,
  emoji       text not null default '📅',
  description text,
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

create policy if not exists "Anyone can view events"
  on public.events for select using (true);

create policy if not exists "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own events"
  on public.events for delete
  using (auth.uid() = user_id);

create policy if not exists "Admins can update events"
  on public.events for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 12. EVENT RSVPs
-- ─────────────────────────────────────────
create table if not exists public.event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

create policy if not exists "Users can manage their own RSVPs"
  on public.event_rsvps for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Anyone can view RSVPs"
  on public.event_rsvps for select using (true);

-- ─────────────────────────────────────────
-- 13. MARKETPLACE PRODUCTS
-- ─────────────────────────────────────────
create table if not exists public.marketplace_products (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  price       numeric(10,2) not null,
  description text,
  category    text not null default 'General',
  image_url   text,
  rating      numeric(3,2) not null default 0,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.marketplace_products enable row level security;

create policy if not exists "Anyone can view products"
  on public.marketplace_products for select using (true);

create policy if not exists "Authenticated users can list products"
  on public.marketplace_products for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own products"
  on public.marketplace_products for delete
  using (auth.uid() = user_id);

create policy if not exists "Admins can update products"
  on public.marketplace_products for update
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 14. WISHLISTS
-- ─────────────────────────────────────────
create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlists enable row level security;

create policy if not exists "Users can manage their own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 15. COURSES
-- ─────────────────────────────────────────
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  provider    text not null,
  duration    text not null,
  description text,
  icon        text not null default '📚',
  category    text not null default 'General',
  created_at  timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy if not exists "Anyone can view courses"
  on public.courses for select using (true);

create policy if not exists "Authenticated users can add courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 16. COURSE ENROLLMENTS
-- ─────────────────────────────────────────
create table if not exists public.course_enrollments (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

alter table public.course_enrollments enable row level security;

create policy if not exists "Users can manage their own enrollments"
  on public.course_enrollments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Anyone can view enrollments"
  on public.course_enrollments for select using (true);

-- ─────────────────────────────────────────
-- 17. ANONYMOUS POSTS
-- ─────────────────────────────────────────
create table if not exists public.anonymous_posts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  content       text not null,
  category      text not null default 'General',
  emoji         text not null default '💜',
  is_flagged    boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.anonymous_posts enable row level security;

create policy if not exists "Anyone can view non-flagged anonymous posts"
  on public.anonymous_posts for select
  using (is_flagged = false);

create policy if not exists "Authenticated users can post anonymously"
  on public.anonymous_posts for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 18. ANONYMOUS POST SUPPORTS
-- ─────────────────────────────────────────
create table if not exists public.anonymous_post_supports (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.anonymous_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.anonymous_post_supports enable row level security;

create policy if not exists "Users can manage their own supports"
  on public.anonymous_post_supports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy if not exists "Anyone can view supports"
  on public.anonymous_post_supports for select using (true);

-- ─────────────────────────────────────────
-- 19. ANONYMOUS POST REPLIES
-- ─────────────────────────────────────────
create table if not exists public.anonymous_post_replies (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.anonymous_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  content    text not null,
  emoji      text not null default '💜',
  is_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.anonymous_post_replies enable row level security;

create policy if not exists "Anyone can view non-flagged replies"
  on public.anonymous_post_replies for select
  using (is_flagged = false);

create policy if not exists "Authenticated users can reply"
  on public.anonymous_post_replies for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- 20. USER ROLES (for admin panel: has_role RPC)
-- ─────────────────────────────────────────
create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy if not exists "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- has_role() function used by AdminPage
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- ─────────────────────────────────────────
-- STORAGE BUCKETS (run if not already created)
-- ─────────────────────────────────────────
-- Avatars bucket for profile photos
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Product images bucket for marketplace
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage RLS: allow authenticated users to upload to their own folder
create policy if not exists "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy if not exists "Users can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid() is not null);

create policy if not exists "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ─────────────────────────────────────────
-- REALTIME (enable for live features)
-- ─────────────────────────────────────────
alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.communities;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.community_chat_messages;
alter publication supabase_realtime add table public.anonymous_posts;
alter publication supabase_realtime add table public.anonymous_post_replies;
alter publication supabase_realtime add table public.map_locations;
alter publication supabase_realtime add table public.marketplace_products;

