CREATE TYPE public.task_status AS ENUM ('requested','searching','matched','awaiting_approval','booking','booked','provider_on_the_way','in_progress','awaiting_completion','completed','cancelled','disputed');

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  raw_request text NOT NULL,
  service_category text,
  service_description text,
  location text,
  preferred_date text,
  preferred_time text,
  budget integer,
  special_requirements text,
  status public.task_status NOT NULL DEFAULT 'requested',
  matched_provider_id uuid,
  matched_service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.swaps(id) ON DELETE SET NULL,
  activity jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own tasks" ON public.tasks FOR SELECT TO authenticated USING (customer_id = auth.uid());
CREATE POLICY "Customers create own tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers update own tasks" ON public.tasks FOR UPDATE TO authenticated USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

CREATE INDEX tasks_customer_idx ON public.tasks(customer_id, created_at DESC);
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();