# Who uses Muni

Muni solves a universal trust problem: personal AI that represents a real person
without inventing facts.

## Buyers and jobs to be done

| Buyer | Pain | What Muni changes |
|---|---|---|
| Job seekers / interns | Portfolio chatbots invent experience | Cited answers from verified cards only |
| Founders | Investor FAQs drift into hype | Honest refuse when knowledge is missing |
| Freelancers | Client intake repeats the same answers | Audience openers + grounded replies |
| Teams shipping agents | Hallucination risk kills demos | Guard policy + eval floors + owner inbox |

## Why this is market relevant

1. Trust is the product, not the chatbot skin.
2. The owner learning loop turns refused questions into knowledge-card work.
3. Bring-your-own persona: replace seed cards with real facts and re-embed.
4. Optional Groq or Gemini live chat path; seed path for zero-key demos and CI.

## Bring your own persona

1. Edit or add cards in the owner desk (or `fixtures/persona/cards.ts` then reseed).
2. Run `pnpm knowledge:embed`.
3. Ask chat questions and inspect the inbox for gaps.
4. Extend guard aliases and thresholds only after running `pnpm eval:sweep`.

## Investor one-liner

Muni is a match-and-refuse engine for personal knowledge: retrieve what is true,
cite it, refuse the rest, and learn from the refusals.
