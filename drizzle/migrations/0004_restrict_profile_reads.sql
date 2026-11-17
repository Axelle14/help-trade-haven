DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Active profiles are viewable" ON public.profiles FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Staff view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin_or_moderator(auth.uid()));