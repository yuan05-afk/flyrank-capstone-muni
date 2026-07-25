export type CapstoneLink = {
  id: string;
  name: string;
  tagline: string;
  url: string;
};

/**
 * Live FlyRank Capstone deployments. URLs can be overridden per environment via
 * NEXT_PUBLIC_CAPSTONE_* vars; the fallbacks are the stable Vercel production aliases.
 */
export const CAPSTONE_LINKS: CapstoneLink[] = [
  {
    id: "checkpoint",
    name: "Checkpoint",
    tagline: "Embeddable widget and lead-capture platform with tenant isolation and geo failover.",
    url:
      process.env.NEXT_PUBLIC_CAPSTONE_CHECKPOINT_URL ||
      "https://checkpoint-flyrank.vercel.app",
  },
  {
    id: "lens",
    name: "Lens",
    tagline: "Image relevance and auto-tagging with a mismatch guard that refuses wrong pairings.",
    url:
      process.env.NEXT_PUBLIC_CAPSTONE_LENS_URL ||
      "https://lens-flyrank.vercel.app",
  },
  {
    id: "broadcast",
    name: "Broadcast",
    tagline: "Social media studio for platform-aware captions and image variants with durable jobs.",
    url:
      process.env.NEXT_PUBLIC_CAPSTONE_BROADCAST_URL ||
      "https://broadcast-flyrank.vercel.app",
  },
  {
    id: "muni",
    name: "Muni",
    tagline: "This grounded personal agent that cites verified knowledge and refuses without evidence.",
    url:
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://muni-flyrank.vercel.app",
  },
];

export function capstoneUrl(id: string): string {
  return CAPSTONE_LINKS.find((link) => link.id === id)?.url ?? "";
}
