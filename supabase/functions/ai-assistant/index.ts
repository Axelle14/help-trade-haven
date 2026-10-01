import { createClient } from "npm:@supabase/supabase-js@2";
import { createResponsesCall } from "../_shared/responses.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const CATEGORIES = [
  "Design", "Tech", "Coding", "Writing", "Resume Help", "Photography", "Tutoring",
  "Language Lessons", "Home Services", "Handyman", "Music", "Fitness", "Cooking", "Gardening", "Other",
];

interface Intent {
  service_category: string;
  keywords: string[];
  service_description: string;
  location: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  budget_points: number | null;
  special_requirements: string | null;
  reply: string;
}

const SYSTEM = `You are the ServiceSwap assistant. Turn a customer's request into a JSON object describing the service they need.
Return ONLY a JSON object with these keys:
- service_category: one of ${CATEGORIES.join(", ")} (cleaning, plumbing, painting, landscaping => "Home Services" or "Handyman")
- keywords: up to 6 lowercase words describing the specific service (e.g. ["cleaning","apartment","deep clean"])
- service_description: one short sentence
- location: city/area named, or null
- preferred_date: as written by the user (e.g. "tomorrow"), or null
- preferred_time: as written (e.g. "afternoon"), or null
- budget_points: integer if a budget is given, else null
- special_requirements: text or null
- reply: one friendly sentence (max 30 words) saying what you are searching for.`;

function parseIntent(text: string): Intent | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const o = JSON.parse(m[0]);
    return {
      service_category: CATEGORIES.includes(o.service_category) ? o.service_category : "Other",
      keywords: Array.isArray(o.keywords) ? o.keywords.slice(0, 6).map((k: unknown) => String(k).toLowerCase()) : [],
      service_description: String(o.service_description ?? ""),
      location: o.location ? String(o.location) : null,
      preferred_date: o.preferred_date ? String(o.preferred_date) : null,
      preferred_time: o.preferred_time ? String(o.preferred_time) : null,
      budget_points: Number.isFinite(o.budget_points) ? Math.round(o.budget_points) : null,
      special_requirements: o.special_requirements ? String(o.special_requirements) : null,
      reply: String(o.reply ?? "Let me find someone for you."),
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ error: "Please sign in to use the assistant." }, 401);
  const userId = auth.user.id;

  let body: { request?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }
  const request = (body.request ?? "").trim().slice(0, 1000);
  if (!request) return json({ error: "Tell me what you need help with." }, 400);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured." }, 500);

  // 1. Understand the request
  let intent: Intent | null = null;
  try {
    const { result } = createResponsesCall(
      req,
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
      [{ role: "system", content: SYSTEM }, { role: "user", content: request }],
    );
    intent = parseIntent(await result.text);
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    if (status === 429) return json({ error: "The assistant is busy. Please try again in a moment." }, 429);
    if (status === 402) return json({ error: "AI credits have run out. Please top up in Settings → Plans & credits." }, 402);
    if (status === 403) return json({ error: "The AI service denied this request." }, 403);
    console.error("AI error", e);
    return json({ error: "The assistant couldn't process that request." }, 502);
  }
  if (!intent) return json({ error: "I couldn't understand that. Try describing the service you need." }, 422);

  // 2. Search providers
  const { data: mem } = await supabase
    .from("city_memberships").select("city_id").eq("user_id", userId)
    .order("joined_at", { ascending: true }).limit(1).maybeSingle();

  const { data: listings, error: lErr } = await supabase.rpc("browse_services", {
    _user_city_id: mem?.city_id ?? null, _limit: 200,
  });
  if (lErr) { console.error(lErr); return json({ error: "Couldn't search providers." }, 500); }

  // 3. Score
  const loc = intent.location?.toLowerCase() ?? "";
  type Row = Record<string, any>;
  const scored = ((listings ?? []) as Row[])
    .filter((l) => l.user_id !== userId)
    .map((l) => {
      const hay = `${l.title} ${l.description ?? ""} ${l.category}`.toLowerCase();
      const kwHits = intent!.keywords.filter((k) => k && hay.includes(k)).length;
      const catMatch = l.category === intent!.service_category;
      const locMatch = !!loc && (`${l.city_name ?? ""} ${l.province ?? ""}`.toLowerCase().includes(loc) || loc.includes((l.city_name ?? "~").toLowerCase()));
      const trust = Number(l.trust_score ?? 100);
      const priceFit = intent!.budget_points == null || l.point_price <= intent!.budget_points;
      const score =
        (catMatch ? 40 : 0) + kwHits * 15 + (locMatch ? 20 : 0) +
        (l.delivery_type !== "in_person" && !locMatch ? 5 : 0) +
        trust * 0.2 + (priceFit ? 10 : -10) +
        (l.distance_km != null ? Math.max(0, 10 - Number(l.distance_km) / 5) : 0);
      const reasons: string[] = [];
      if (catMatch) reasons.push("Exact service match");
      else if (kwHits) reasons.push("Related skills");
      if (locMatch) reasons.push(`Based in ${l.city_name}`);
      else if (l.delivery_type !== "in_person") reasons.push("Available online");
      if (l.distance_km != null) reasons.push(`${l.distance_km} km away`);
      if (trust >= 80) reasons.push("High trust score");
      if (intent!.budget_points != null && priceFit) reasons.push("Within your budget");
      return { ...l, match_score: Math.round(score), reasons, relevant: catMatch || kwHits > 0 };
    })
    .filter((l) => l.relevant)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 3);

  // 4. Persist task
  const { data: task } = await supabase.from("tasks").insert({
    customer_id: userId,
    raw_request: request,
    service_category: intent.service_category,
    service_description: intent.service_description,
    location: intent.location,
    preferred_date: intent.preferred_date,
    preferred_time: intent.preferred_time,
    budget: intent.budget_points,
    special_requirements: intent.special_requirements,
    status: scored.length ? "awaiting_approval" : "searching",
    activity: [
      { step: "Understood request", at: new Date().toISOString() },
      { step: `Searched ${listings?.length ?? 0} listings`, at: new Date().toISOString() },
      { step: `Found ${scored.length} matches`, at: new Date().toISOString() },
    ],
  }).select("id").single();

  return json({
    task_id: task?.id ?? null,
    reply: intent.reply,
    intent,
    providers: scored.map(({ relevant: _r, ...p }) => p),
  });
});
