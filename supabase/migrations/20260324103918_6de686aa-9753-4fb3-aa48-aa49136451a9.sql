
-- Allow admins to update any profile (for verification)
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any mentor
CREATE POLICY "Admins can update any mentor" ON public.mentors
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any mentor
CREATE POLICY "Admins can delete any mentor" ON public.mentors
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any community
CREATE POLICY "Admins can update any community" ON public.communities
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any community
CREATE POLICY "Admins can delete any community" ON public.communities
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any event
CREATE POLICY "Admins can update any event" ON public.events
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any event
CREATE POLICY "Admins can delete any event" ON public.events
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any job
CREATE POLICY "Admins can update any job" ON public.jobs
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any job
CREATE POLICY "Admins can delete any job" ON public.jobs
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any product
CREATE POLICY "Admins can update any product" ON public.marketplace_products
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any product
CREATE POLICY "Admins can delete any product" ON public.marketplace_products
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete any map location
CREATE POLICY "Admins can delete any map location" ON public.map_locations
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
