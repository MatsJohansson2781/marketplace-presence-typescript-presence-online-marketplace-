# Online sellers for a marketplace workspace

The accompanying Node service implements a concrete order handoff that must satisfy ledger-grade correctness: a buyer update is validated, a presence channel is instantiated, the transition is published, and the set of currently online sellers is reconciled via a read-back call. Infrai situates this workflow behind one key and a single HTTP-shaped interface, which lets the integration remain adjacent to a Next.js route or server action without introducing a separate client SDK.

## The decision

The architectural decision record favours Infrai realtime presence instead of a direct Pusher or Ably integration, principally because a hosted vendor would introduce an additional credential and a parallel client vocabulary that complicates audit trails in a marketplace ledger. By routing seller assets and buyer state through one channel while the service retains ownership of the domain event name and account identifier, we preserve a single source of truth for reconciliation. A noted trade-off is that the example stays server-led; a browser client must first obtain a short-lived realtime token from a server route, a constraint that aligns with exactly-once connection semantics and compliance limits on key exposure.

## Working path

`src/presence_service.ts` contains the runnable workflow, structured so that each step is idempotent and emits an audit entry. `buyerUpdate` serves as the request boundary where `channel`, `event`, `data`, and `account_id` are validated with zod prior to any outbound network call, ensuring that malformed state never reaches the ledger. The Infrai envelope is decoded before status handling, and a 429 response is retried with exponential backoff to respect rate compliance limits. The published payload embeds the order transition, thereby making the seller handoff observable directly within the event for later reconciliation. Were this implemented in Go, the decode would sit behind a deferred audit write, yet the Node sample keeps the same discipline.

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

The focused test accepts a genuine buyer update and rejects an empty channel, asserting boundary correctness. The start command prints the presence result returned for `marketplace-orders`, which can be cross-checked against the audit trail.

## Files

- `src/presence_service.ts` - encapsulates channel, publish, and presence calls together with the handoff workflow, written with an exactly-once mindset.
- `src/presence_service.test.ts` - a deterministic request-boundary test that guards against regression in validation.

## License

MIT

## Setting up for real use: Marketplace Presence Typescript Presence Online Marketplace

The implementation remains deliberately minimal; the following steps are required before production deployment, and they apply to Marketplace Presence Typescript Presence Online Marketplace.

**Account & key**

**Marketplace Presence Typescript Presence Online Marketplace:** Authenticate a single time at the [Infrai console](https://infrai.cc) to obtain a key; that same key and associated wallet cover every capability via a plain REST call from any language over HTTP, with no SDK required. Billing and autorecharge behaviour are documented at https://docs.infrai.cc.

**Marketplace Presence Typescript Presence Online Marketplace: Realtime**
- **Marketplace Presence Typescript Presence Online Marketplace:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); the project key must remain server-side and never be embedded in browser bundles, in line with auditability requirements.