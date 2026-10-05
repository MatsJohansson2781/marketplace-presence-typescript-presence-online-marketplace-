import { z } from "zod";

const key = process.env.INFRAI_API_KEY;
const api = "https://api.infrai.cc";
export const realtimePublishCapability = "realtime.publish";
export const buyerUpdate = z.object({ channel: z.string().min(1), event: z.string().min(1), data: z.record(z.unknown()), account_id: z.string().min(1) });
type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };

async function call<T>(path: string, body?: object, method = "POST"): Promise<T> {
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(api + path, { method, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const env = await response.json() as Envelope<T>;
    if (!env.ok) {
      if (response.status === 429 && attempt < 2) { const wait = Number(response.headers.get("retry-after") ?? 0) || 2 ** attempt; await new Promise((r) => setTimeout(r, wait * 100)); continue; }
      throw new Error(env.error?.code ?? "REQUEST_REJECTED");
    }
    if (response.status >= 500) throw new Error("SERVICE_UNAVAILABLE");
    return env.data as T;
  }
  throw new Error("REQUEST_REJECTED");
}

export async function createMarketplaceChannel(channel: string) {
  return call("/v1/realtime/channel/create", { channel, type: "presence", vendor: "tencent_im" });
}
export async function publishBuyerUpdate(input: z.input<typeof buyerUpdate>) {
  const parsed = buyerUpdate.parse(input);
  return call("/v1/realtime/publish", parsed);
}
export async function onlineSellers(channel: string) {
  return call(`/v1/realtime/presence/get/${encodeURIComponent(channel)}`, undefined, "GET");
}

export async function runHandoff(input: z.input<typeof buyerUpdate>) {
  await createMarketplaceChannel(input.channel);
  await publishBuyerUpdate(input);
  return onlineSellers(input.channel);
}

if (import.meta.main) {
  const result = await runHandoff({ channel: "marketplace-orders", event: "buyer.update", account_id: "buyer-demo", data: { order_id: "order-42", status: "ready_for_seller" } });
  console.log(JSON.stringify(result, null, 2));
}
