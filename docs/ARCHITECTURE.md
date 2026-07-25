# Muni architecture

## Layers

`repository -> service -> route handler`

Providers implement `ChatProvider` and `EmbeddingProvider`. Seed is default.
Optional Gemini activates only with local `GEMINI_API_KEY`.

## Pipeline

```text
knowledge cards -> durable embed jobs -> card vectors
visitor question -> question vector -> top-k retrieve
               -> Grounding Guard similarity floor
               -> ChatProvider grounded draft
               -> citation + confidence checks
               -> grounded | guarded | refused
               -> owner inbox + cost ledger
```

## Grounding Guard (`grounding_policy_v1`)

1. Best retrieval score below `SIM_THRESHOLD` → refuse
2. Citations must map to retrieved card ids → else guard
3. Confidence below `CONF_THRESHOLD` → guard

Every `AgentAnswer` stores `policyId` and `featuresJson`.

## Jobs

Embed jobs use idempotency keys, leases, heartbeats, retries, and budget stops.
