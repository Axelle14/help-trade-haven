import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSwapConversation } from "./chat";

export type SwapStatus =
  | "pending" | "accepted" | "active"
  | "completed" | "cancelled" | "declined";

export interface Swap {
  id: string;
  requester_id: string;
  provider_id: string;
  requester_offer_title: string;
  provider_offer_title: string;
  requester_skill: string | null;
  provider_skill: string | null;
  status: SwapStatus;
  scheduled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSwapInput {
  providerId: string;
  requesterOfferTitle: string;
  providerOfferTitle: string;
  requesterSkill?: string;
  providerSkill?: string;
  notes?: string;
}

/** Create a swap proposal (status = pending) and open its dedicated conversation. */
export async function proposeSwap(meId: string, input: CreateSwapInput): Promise<Swap> {
  if (meId === input.providerId) throw new Error("You can't swap with yourself.");

  const { data, error } = await supabase
    .from("swaps")
    .insert({
      requester_id: meId,
      provider_id: input.providerId,
      requester_offer_title: input.requesterOfferTitle,
      provider_offer_title: input.providerOfferTitle,
      requester_skill: input.requesterSkill ?? null,
      provider_skill: input.providerSkill ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  const swap = data as Swap;

  // Auto-create the dedicated chat so messaging works immediately.
  await getOrCreateSwapConversation(swap.id, meId);
  return swap;
}

/** Update a swap's status (lifecycle transition). RLS ensures only participants can. */
export async function updateSwapStatus(swapId: string, status: SwapStatus): Promise<Swap> {
  const { data, error } = await supabase
    .from("swaps")
    .update({ status })
    .eq("id", swapId)
    .select()
    .single();
  if (error) throw error;
  return data as Swap;
}

export async function getSwap(swapId: string): Promise<Swap | null> {
  const { data, error } = await supabase
    .from("swaps").select("*").eq("id", swapId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as Swap | null;
}

export async function listMySwaps(meId: string): Promise<Swap[]> {
  const { data, error } = await supabase
    .from("swaps")
    .select("*")
    .or(`requester_id.eq.${meId},provider_id.eq.${meId}`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Swap[];
}
