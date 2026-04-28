import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSwapConversation } from "./chat";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "active"
  | "completed"
  | "cancelled"
  | "declined";

export interface PointOrder {
  id: string;
  buyer_id: string | null;
  seller_id: string | null;
  service_id: string | null;
  points_spent: number;
  is_point_order: boolean;
  status: OrderStatus;
  requester_offer_title: string;
  provider_offer_title: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
  duration_minutes: number;
}

/**
 * Place a point order against a service listing.
 * Atomically debits the buyer's wallet, creates a swaps row (is_point_order=true),
 * opens a conversation, and writes a ledger entry.
 */
export async function placePointOrder(
  serviceId: string,
  note?: string,
): Promise<PointOrder> {
  const { data, error } = await supabase.rpc("place_point_order", {
    _service_id: serviceId,
    _note: note ?? undefined,
  });
  if (error) throw error;
  const order = data as PointOrder;
  // Open the chat for this order so messaging works immediately.
  const { data: auth } = await supabase.auth.getUser();
  if (auth.user && order?.id) {
    try {
      await getOrCreateSwapConversation(order.id, auth.user.id);
    } catch {
      /* non-fatal */
    }
  }
  return order;
}

export async function completePointOrder(orderId: string): Promise<PointOrder> {
  const { data, error } = await supabase.rpc("complete_point_order", {
    _order_id: orderId,
  });
  if (error) throw error;
  return data as PointOrder;
}

export async function cancelPointOrder(
  orderId: string,
  reason?: string,
): Promise<PointOrder> {
  const { data, error } = await supabase.rpc("cancel_point_order", {
    _order_id: orderId,
    _reason: reason ?? undefined,
  });
  if (error) throw error;
  return data as PointOrder;
}

export async function listMyPointOrders(userId: string): Promise<PointOrder[]> {
  const { data, error } = await supabase
    .from("swaps")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .eq("is_point_order", true)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PointOrder[];
}
