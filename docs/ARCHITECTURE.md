# Muni architecture

## Layers

`repository -> service -> route handler`

Providers implement `ChatProvider` and `EmbeddingProvider`. Seed is default.
Optional Groq (`CHAT_PROVIDER=groq`) or Gemini (`CHAT_PROVIDER=gemini`) activate
only with local keys. Embeddings stay on seed for reproducible demos unless you
opt into a live embed provider.

## Pipeline

```text
knowledge cards -> durable embed jobs -> card vectors
visitor question -> question vector -> top-k retrieve (+ optional focusCardId)
               -> social opener short-circuit (hi / thanks) when applicable
               -> Grounding Guard similarity + topical overlap floors
               -> ChatProvider grounded draft
               -> citation + confidence checks
               -> grounded | open | guarded | refused
               -> owner inbox + cost ledger
```

## Grounding Guard (`grounding_policy_v1`)

1. Best retrieval score below `SIM_THRESHOLD` -> refuse
2. Topical overlap below floor -> refuse (skipped when `focusCardId` is pinned)
3. Citations must map to retrieved card ids -> else guard
4. Confidence below `CONF_THRESHOLD` -> guard

Every `AgentAnswer` stores `policyId` and `featuresJson`.

## Jobs

Embed jobs use idempotency keys, leases, heartbeats, retries, and budget stops.
