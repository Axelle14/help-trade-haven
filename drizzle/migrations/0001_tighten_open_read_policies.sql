DROP POLICY IF EXISTS "Wallets readable by signed-in users" ON public.wallets;
CREATE POLICY "Users read own wallet" ON public.wallets FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone signed in can read trust scores" ON public.trust_scores;
CREATE POLICY "Trust scores readable by related users" ON public.trust_scores FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_admin_or_moderator(auth.uid())
    OR EXISTS (SELECT 1 FROM public.city_memberships a JOIN public.city_memberships b ON a.city_id = b.city_id
               WHERE a.user_id = auth.uid() AND b.user_id = trust_scores.user_id)
    OR EXISTS (SELECT 1 FROM public.swaps s WHERE (s.requester_id = auth.uid() AND s.provider_id = trust_scores.user_id)
               OR (s.provider_id = auth.uid() AND s.requester_id = trust_scores.user_id))
  );

DROP POLICY IF EXISTS "Availability is viewable by signed-in users" ON public.availability;
CREATE POLICY "Availability readable by owner and swap partners" ON public.availability FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.swaps s WHERE (s.requester_id = auth.uid() AND s.provider_id = availability.user_id)
               OR (s.provider_id = auth.uid() AND s.requester_id = availability.user_id))
  );

DROP POLICY IF EXISTS "Reviews are viewable by signed-in users" ON public.reviews;
CREATE POLICY "Reviews readable when relevant" ON public.reviews FOR SELECT TO authenticated
  USING (
    auth.uid() = reviewer_id
    OR auth.uid() = reviewee_id
    OR public.is_admin_or_moderator(auth.uid())
    OR (
      NOT public.is_blocked_between(auth.uid(), reviewee_id)
      AND NOT public.is_blocked_between(auth.uid(), reviewer_id)
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = reviews.reviewee_id AND p.status = 'active')
    )
  );

DROP POLICY IF EXISTS "Memberships viewable by signed-in users" ON public.city_memberships;
CREATE POLICY "Memberships readable by same-city members" ON public.city_memberships FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_city_member(city_id, auth.uid())
    OR public.is_admin_or_moderator(auth.uid())
  );

DROP POLICY IF EXISTS "Reactions viewable by signed-in users" ON public.city_message_reactions;
CREATE POLICY "Reactions readable by city members" ON public.city_message_reactions FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.city_messages m WHERE m.id = city_message_reactions.message_id
               AND public.is_city_moderator(m.city_id, auth.uid()) OR public.is_city_member(m.city_id, auth.uid()))
  );