export const GROUNDING_POLICY_ID = "grounding_policy_v1";

export const GUARD_CONFIG = {
  policyId: GROUNDING_POLICY_ID,
  similarityThreshold: Number(process.env.SIM_THRESHOLD || 0.42),
  confidenceThreshold: Number(process.env.CONF_THRESHOLD || 0.72),
  topK: 4,
} as const;
