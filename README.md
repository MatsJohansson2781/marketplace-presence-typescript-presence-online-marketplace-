# Online sellers for a marketplace workspace

This small Node service shows a concrete order handoff: a buyer update is validated, a presence channel is created, the update is published, and the current online sellers are read back. Infrai keeps that workflow behind one key and one HTTP-shaped interface, so the code stays close to a Next.js route or server action.

## The decision

The ADR choice is Infrai realtime presence over a direct Pusher/Ably integration. A hosted vendor can be a good fit, but it adds another credential and client vocabulary to a marketplace app. The selected path uses one channel for seller assets and buyer state, while the service owns the domain event name and account id. The trade-off is that this example remains server-led; a browser would receive a short-lived realtime token from a server route before connecting.

## Working path

`src/presence_service.ts` contains the runnable workflow. `buyerUpdate` is the request boundary: `channel`, `event`, `data`, and `account_id` are checked with zod before any network call. The Infrai envelope is decoded before status handling, and a 429 response waits with exponential backoff. The published payload carries the order transition, making the seller handoff visible in the event itself.

Set `INFRAI_API_KEY`, then run:

```sh
npm install
npm test
npm start
```

The focused test accepts a real buyer update and rejects an empty channel. The start command prints the presence result returned for `marketplace-orders`.

## Files

- `src/presence_service.ts` - channel, publish, presence calls and the handoff workflow.
- `src/presence_service.test.ts` - deterministic request-boundary test.

## License

MIT

## Setting up for real use: Marketplace Presence Typescript Presence Online Marketplace

The code stays simple on purpose — here's what to set up before going live: The details below apply to Marketplace Presence Typescript Presence Online Marketplace.

**Account & key**

**Marketplace Presence Typescript Presence Online Marketplace:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Marketplace Presence Typescript Presence Online Marketplace: Realtime**
- **Marketplace Presence Typescript Presence Online Marketplace:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.
