import { supabase } from "@/integrations/supabase/client";

export interface Wallet {
  user_id: string;
  balance_points: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  type: "earn" | "spend" | "refund" | "bonus" | "penalty" | "signup_bonus";
  amount: number;
  reference_order_id: string | null;
  note: string | null;
  created_at: string;
}

/** Read the signed-in user's wallet. Returns a zero-balance shape if none yet. */
export async function getMyWallet(userId: string): Promise<Wallet> {
  const { data, error } = await supabase
    .from("wallets")
    .select("user_id, balance_points, lifetime_earned, lifetime_spent")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (
    data ?? {
      user_id: userId,
      balance_points: 0,
      lifetime_earned: 0,
      lifetime_spent: 0,
    }
  );
}

export async function listMyTransactions(
  userId: string,
  limit = 20,
): Promise<PointTransaction[]> {
  const { data, error } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PointTransaction[];
}

/** Suggested point price for a category + duration. */
export async function suggestPointPrice(
  category: string,
  durationMinutes = 60,
  sellerId?: string,
): Promise<{ suggested: number; min_price: number; max_price: number }> {
  const { data, error } = await supabase.rpc("suggest_point_price", {
    _category: category,
    _duration_minutes: durationMinutes,
    _seller_id: sellerId ?? undefined,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ?? { suggested: 50, min_price: 35, max_price: 70 };
}
