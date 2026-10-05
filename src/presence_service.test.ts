import { buyerUpdate } from "./presence_service.ts";

const accepted = buyerUpdate.safeParse({ channel: "marketplace-orders", event: "buyer.update", account_id: "buyer-1", data: { order_id: "order-42" } });
if (!accepted.success) throw new Error("valid buyer update was rejected");
const rejected = buyerUpdate.safeParse({ channel: "", event: "buyer.update", account_id: "buyer-1", data: {} });
if (rejected.success) throw new Error("empty channel was accepted");
console.log("buyer update boundary: pass");
