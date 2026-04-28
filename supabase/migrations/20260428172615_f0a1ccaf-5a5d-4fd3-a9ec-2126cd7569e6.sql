-- ============================================================================
-- PHASE 1+2: Point marketplace foundation
-- ============================================================================

-- ---- 1. services: add marketplace fields ------------------------------------
DO $$ BEGIN
  CREATE TYPE public.delivery_type AS ENUM ('online', 'in_person');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS point_price INT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INT NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS delivery_type public.delivery_type NOT NULL DEFAULT 'in_person';

ALTER TABLE public.services
  ADD CONSTRAINT services_point_price_range CHECK (point_price BETWEEN 5 AND 1000),
  ADD CONSTRAINT services_duration_range CHECK (estimated_duration_minutes BETWEEN 5 AND 600);

CREATE INDEX IF NOT EXISTS idx_services_active_city ON public.services (city_id, is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_services_delivery ON public.services (delivery_type) WHERE is_active;

-- ---- 2. swaps: add point-order fields (legacy fields untouched) -------------
ALTER TABLE public.swaps
  ADD COLUMN IF NOT EXISTS buyer_id UUID,
  ADD COLUMN IF NOT EXISTS seller_id UUID,
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS points_spent INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_point_order BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_swaps_buyer ON public.swaps (buyer_id) WHERE is_point_order;
CREATE INDEX IF NOT EXISTS idx_swaps_seller ON public.swaps (seller_id) WHERE is_point_order;

-- ---- 3. wallets -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id UUID PRIMARY KEY,
  balance_points INT NOT NULL DEFAULT 0,
  lifetime_earned INT NOT NULL DEFAULT 0,
  lifetime_spent INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT wallets_balance_nonneg CHECK (balance_points >= 0)
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wallets readable by signed-in users"
  ON public.wallets FOR SELECT TO authenticated USING (true);

-- No INSERT/UPDATE/DELETE policies → only SECURITY DEFINER functions can write.

CREATE TRIGGER trg_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---- 4. point_transactions (ledger) -----------------------------------------
DO $$ BEGIN
  CREATE TYPE public.point_tx_type AS ENUM
    ('earn', 'spend', 'refund', 'bonus', 'penalty', 'signup_bonus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type public.point_tx_type NOT NULL,
  amount INT NOT NULL,
  reference_order_id UUID REFERENCES public.swaps(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_point_tx_user ON public.point_transactions (user_id, created_at DESC);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ledger"
  ON public.point_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Mods read all ledger"
  ON public.point_transactions FOR SELECT TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()));

-- ---- 5. helper: ensure wallet exists ----------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_wallet(_user_id UUID)
RETURNS public.wallets
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_w public.wallets;
BEGIN
  INSERT INTO public.wallets (user_id) VALUES (_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO v_w FROM public.wallets WHERE user_id = _user_id;
  RETURN v_w;
END $$;

-- ---- 6. seed wallets for existing users + signup bonus ----------------------
CREATE OR REPLACE FUNCTION public.grant_signup_bonus(_user_id UUID, _amount INT DEFAULT 100)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_wallet(_user_id);
  -- Idempotent: only grant if no signup_bonus exists yet.
  IF NOT EXISTS (
    SELECT 1 FROM public.point_transactions
     WHERE user_id = _user_id AND type = 'signup_bonus'
  ) THEN
    UPDATE public.wallets
       SET balance_points = balance_points + _amount,
           lifetime_earned = lifetime_earned + _amount
     WHERE user_id = _user_id;
    INSERT INTO public.point_transactions (user_id, type, amount, note)
      VALUES (_user_id, 'signup_bonus', _amount, 'Welcome to Service Swap');
  END IF;
END $$;

-- Backfill existing profiles
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.grant_signup_bonus(r.id, 100);
  END LOOP;
END $$;

-- Hook into existing handle_new_user flow via a separate trigger
CREATE OR REPLACE FUNCTION public.on_profile_created_grant_bonus()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.grant_signup_bonus(NEW.id, 100);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_profiles_signup_bonus ON public.profiles;
CREATE TRIGGER trg_profiles_signup_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_profile_created_grant_bonus();

-- ---- 7. place_point_order: atomic debit + create order ----------------------
CREATE OR REPLACE FUNCTION public.place_point_order(
  _service_id UUID,
  _note TEXT DEFAULT NULL
) RETURNS public.swaps
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_buyer UUID := auth.uid();
  v_service public.services;
  v_wallet public.wallets;
  v_swap public.swaps;
BEGIN
  IF v_buyer IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_service FROM public.services WHERE id = _service_id AND is_active = true;
  IF v_service.id IS NULL THEN RAISE EXCEPTION 'Service not found or inactive'; END IF;
  IF v_service.user_id = v_buyer THEN RAISE EXCEPTION 'You cannot order your own service'; END IF;

  IF public.is_blocked_between(v_buyer, v_service.user_id) THEN
    RAISE EXCEPTION 'Cannot order: a block exists between you and this user';
  END IF;

  -- Lock wallet row, check balance.
  PERFORM public.ensure_wallet(v_buyer);
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_buyer FOR UPDATE;

  IF v_wallet.balance_points < v_service.point_price THEN
    RAISE EXCEPTION 'Insufficient points: balance % < price %',
      v_wallet.balance_points, v_service.point_price;
  END IF;

  -- Debit buyer.
  UPDATE public.wallets
     SET balance_points = balance_points - v_service.point_price,
         lifetime_spent = lifetime_spent + v_service.point_price
   WHERE user_id = v_buyer;

  -- Create order (mapped onto swaps table for compat with chat/notifications).
  INSERT INTO public.swaps (
    requester_id, provider_id,
    buyer_id, seller_id, service_id, points_spent, is_point_order,
    requester_offer_title, provider_offer_title,
    requester_skill, provider_skill,
    notes, status, duration_minutes
  ) VALUES (
    v_buyer, v_service.user_id,
    v_buyer, v_service.user_id, v_service.id, v_service.point_price, true,
    v_service.point_price || ' points',
    v_service.title,
    NULL, v_service.category,
    _note, 'pending', v_service.estimated_duration_minutes
  ) RETURNING * INTO v_swap;

  -- Ledger entry for buyer (escrow-style spend).
  INSERT INTO public.point_transactions (user_id, type, amount, reference_order_id, note)
  VALUES (v_buyer, 'spend', -v_service.point_price, v_swap.id,
          'Ordered: ' || v_service.title);

  RETURN v_swap;
END $$;

-- ---- 8. complete_point_order: credit seller --------------------------------
CREATE OR REPLACE FUNCTION public.complete_point_order(_order_id UUID)
RETURNS public.swaps
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_o public.swaps;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_o FROM public.swaps WHERE id = _order_id FOR UPDATE;
  IF v_o.id IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF NOT v_o.is_point_order THEN RAISE EXCEPTION 'Not a point order'; END IF;
  IF v_uid <> v_o.buyer_id AND v_uid <> v_o.seller_id THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;
  IF v_o.status = 'completed' THEN RAISE EXCEPTION 'Already completed'; END IF;
  IF v_o.status = 'cancelled' THEN RAISE EXCEPTION 'Order was cancelled'; END IF;

  UPDATE public.swaps SET status = 'completed' WHERE id = _order_id;

  PERFORM public.ensure_wallet(v_o.seller_id);
  UPDATE public.wallets
     SET balance_points = balance_points + v_o.points_spent,
         lifetime_earned = lifetime_earned + v_o.points_spent
   WHERE user_id = v_o.seller_id;

  INSERT INTO public.point_transactions (user_id, type, amount, reference_order_id, note)
  VALUES (v_o.seller_id, 'earn', v_o.points_spent, v_o.id,
          'Completed: ' || v_o.provider_offer_title);

  SELECT * INTO v_o FROM public.swaps WHERE id = _order_id;
  RETURN v_o;
END $$;

-- ---- 9. cancel_point_order: refund buyer -----------------------------------
CREATE OR REPLACE FUNCTION public.cancel_point_order(_order_id UUID, _reason TEXT DEFAULT NULL)
RETURNS public.swaps
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_o public.swaps;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO v_o FROM public.swaps WHERE id = _order_id FOR UPDATE;
  IF v_o.id IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF NOT v_o.is_point_order THEN RAISE EXCEPTION 'Not a point order'; END IF;
  IF v_uid <> v_o.buyer_id AND v_uid <> v_o.seller_id THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;
  IF v_o.status = 'completed' THEN RAISE EXCEPTION 'Cannot cancel a completed order'; END IF;
  IF v_o.status = 'cancelled' THEN RETURN v_o; END IF;

  UPDATE public.swaps SET status = 'cancelled' WHERE id = _order_id;

  -- Refund buyer in full (early MVP — no-show penalty handled separately).
  PERFORM public.ensure_wallet(v_o.buyer_id);
  UPDATE public.wallets
     SET balance_points = balance_points + v_o.points_spent,
         lifetime_spent = GREATEST(0, lifetime_spent - v_o.points_spent)
   WHERE user_id = v_o.buyer_id;

  INSERT INTO public.point_transactions (user_id, type, amount, reference_order_id, note)
  VALUES (v_o.buyer_id, 'refund', v_o.points_spent, v_o.id,
          COALESCE('Refund: ' || _reason, 'Order cancelled'));

  SELECT * INTO v_o FROM public.swaps WHERE id = _order_id;
  RETURN v_o;
END $$;

-- ---- 10. suggest_point_price: category pricing engine ----------------------
CREATE OR REPLACE FUNCTION public.suggest_point_price(
  _category TEXT,
  _duration_minutes INT DEFAULT 60,
  _seller_id UUID DEFAULT NULL
) RETURNS TABLE (suggested INT, min_price INT, max_price INT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_base INT;
  v_trust INT := 100;
  v_modifier NUMERIC := 1.0;
BEGIN
  v_base := CASE lower(coalesce(_category,''))
    WHEN 'tutoring'        THEN 40
    WHEN 'design'          THEN 60
    WHEN 'coding'          THEN 90
    WHEN 'fitness'         THEN 45
    WHEN 'photography'     THEN 70
    WHEN 'writing'         THEN 35
    WHEN 'resume'          THEN 30
    WHEN 'resume help'     THEN 30
    WHEN 'language'        THEN 50
    WHEN 'language lessons' THEN 50
    WHEN 'music'           THEN 50
    WHEN 'cooking'         THEN 40
    WHEN 'handyman'        THEN 55
    WHEN 'gardening'       THEN 40
    ELSE 50
  END;

  -- Duration modifier (linear, capped).
  v_modifier := v_modifier * GREATEST(0.5, LEAST(2.0, _duration_minutes::NUMERIC / 60.0));

  -- Trust bonus.
  IF _seller_id IS NOT NULL THEN
    SELECT score INTO v_trust FROM public.trust_scores WHERE user_id = _seller_id;
    v_trust := COALESCE(v_trust, 100);
    IF v_trust >= 90 THEN v_modifier := v_modifier * 1.10;
    ELSIF v_trust < 60 THEN v_modifier := v_modifier * 0.90;
    END IF;
  END IF;

  suggested := GREATEST(5, LEAST(1000, ROUND(v_base * v_modifier)::INT));
  min_price := GREATEST(5, ROUND(suggested * 0.7)::INT);
  max_price := LEAST(1000, ROUND(suggested * 1.4)::INT);
  RETURN NEXT;
END $$;

-- ---- 11. grant function execute to authenticated ---------------------------
GRANT EXECUTE ON FUNCTION public.place_point_order(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_point_order(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_point_order(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.suggest_point_price(TEXT, INT, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.ensure_wallet(UUID) TO authenticated;