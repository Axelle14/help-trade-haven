DROP POLICY IF EXISTS "Reactions readable by city members" ON public.city_message_reactions;
CREATE POLICY "Reactions readable by city members" ON public.city_message_reactions FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.city_messages m WHERE m.id = city_message_reactions.message_id
               AND (public.is_city_member(m.city_id, auth.uid()) OR public.is_city_moderator(m.city_id, auth.uid())))
  );