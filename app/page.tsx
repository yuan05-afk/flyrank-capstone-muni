import { LandingPage } from "@/components/LandingPage";
import { PERSONA_CARDS } from "@/fixtures/persona/cards";

export default function Page() {
  // Derived at build time from the knowledge source of truth so the landing
  // stat cannot drift when cards are added.
  return <LandingPage knowledgeCount={PERSONA_CARDS.length} />;
}
