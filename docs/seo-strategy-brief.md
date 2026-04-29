# Noruma SEO Engine — Brief for Page-Type Suggestions

This is a brief for an external LLM. The ask is at the bottom: **suggest distinct page types that would capture search intent from our audience, can be auto-built from the data sources we already have, and fit Noruma's positioning.**

## 1. Product

**Noruma** is a real-time AI copilot for sales interviews. The candidate joins a live interview (Zoom, Teams, etc.). Noruma listens to the interviewer's question, classifies it, and surfaces the perfect answer on the candidate's screen — in under 500ms — drawn from the candidate's own deal stories, comp history, and pre-loaded prep.

Tagline: *"Noruma populates the perfect answer for every question in real time."*

Privacy: audio is processed live, not retained unless the user opts in. No video or screen capture.

**Marketing site:** [noruma.ai](https://noruma.ai)
**SEO site (this engine):** [learn.noruma.ai](https://learn.noruma.ai)

## 2. Audience

Tech sales professionals interviewing for new roles:
- BDR / SDR (entry-level, high-volume prospecting)
- Commercial AE (mid-cycle deals, $5k-$50k ARR)
- Mid-Market AE ($50k-$250k ARR)
- Enterprise AE ($250k+ ARR, multi-threaded sales)
- Sales leadership (Sales Manager / RVP / VP Sales)

These users are mid-job-search. They Google one of:
- *"Salesforce Enterprise AE interview questions"*
- *"How much do Gong AEs make"*
- *"What does the HubSpot interview process look like"*
- *"MEDDPICC vs MEDDIC"*
- *"How to answer 'walk me through your largest deal'"*

The pain we monetize: the gap between *"I prepared"* and *"I performed live."* Even good prep falls apart when a question hits at an unexpected angle. Noruma bridges that.

## 3. SEO funnel role

learn.noruma.ai is the top-of-funnel acquisition channel. We don't sell the free SEO content; the SEO content drives candidates to discover the paid Noruma product. Each page has prominent CTAs that reinforce the funnel: *"This page is the prep. When you're in the live interview, Noruma populates the perfect answer in real time."*

## 4. Already built

### Page type A: `sales-interview-prep` (autonomous engine)
URL: `/sales-interview-prep/<company-slug>/<role-slug>`
Example: `/sales-interview-prep/salesforce/enterprise-ae`

Per-page sections (each gracefully omits when source data is empty):
- Hero (H1 + 2-3 sentence lede anchored on real numbers)
- Compensation table (Levels.fyi sourced)
- Interview process (when extractable from Reddit advice)
- "What {company} looks for" (Wayback-archived job description bullets)
- "What r/sales says" (cited advice quotes from public r/sales threads, banlist-clean)
- "Reports from r/sales" (verbatim first-person interview question reports, when present)
- "How to prep" (LLM-generated narrative, anchored on STAR / MEDDPICC / BANT, voice-aligned)
- FAQ (5-7 templated + Reddit-derived Q+A pairs)
- CTA card

Inter-section CTAs run between major sections (different headline + body per section, all link to noruma.ai with UTM).

Cron schedule: every 4 hours, max 3 new pages per fire. Queue: ~180 (30 priority companies × 6 roles).

**Currently live: 8 pages.**

### Page type B: `guides` (general SEO; ~11 pages)
URL: `/guides/<slug>`
Examples:
- `/guides/how-to-answer-walk-me-through-a-complex-deal`
- `/guides/star-method-sales-interview-examples`
- `/guides/first-30-60-90-day-plan-sales-role`

Generic "how to answer X" content. Not company-specific. Built ad-hoc by an earlier system; not on the autonomous engine.

### Page type C: `compare` and `glossary` (placeholder)
Schemas defined in Astro but no content yet.

## 5. Data sources we can source from autonomously

All free, public, no API keys required.

| Source | What it gives | Limits |
|---|---|---|
| **Levels.fyi** | Per-company × role comp distributions (base salary p25/p50/p75, OTE estimate, sample size) | Some companies have n<5; many privately-held SaaS missing |
| **Reddit JSON** (public, no API key) | Public r/sales / r/SaaSSales discussions, including advice quotes that mention specific companies | Quote quality varies; r/sales doesn't always have first-person reports for every company |
| **Wayback Machine** | Archived snapshots of company careers pages (job requirements, sometimes interview process notes) | Many careers URLs aren't recently archived |
| **Our own product positioning** | Comparison vs hypothetical alternatives | We never name competitors (Yoodli, Final Round AI, Huru, Sensei AI) on any page |

We intentionally **skip** Glassdoor (ToS), RepVue (anti-bot since 2024), LinkedIn (auth-walled), and any paid SEO tooling. Operator's existing private interview-coaching corpus is also off-limits for public content (privacy + brand exposure).

## 6. Hard constraints (any LLM-suggested page must respect these)

- **Every datapoint needs a citation URL.** No fabrication. Acceptable to omit data we don't have rather than guess.
- **No banlist phrases:** "feel felt found", "AIDA structure", "preemptive strike", "selling to priorities", "shared agenda", and a few others (these signal a specific training corpus we don't want exposed).
- **No competitor mentions:** Yoodli, Final Round AI, Huru, Sensei AI.
- **No banned openers:** "In today's competitive landscape", "When it comes to", "It's no secret that", "Picture this", etc.
- **Voice:** crisp, second-person, quantified. Sales pros talking to sales pros. No corporate jargon, no emojis, no em-dashes used as filler.
- **Audience:** sales execs interviewing at SaaS companies. Not generic job-seekers, not engineers, not non-sales roles.
- **Page must be schema-validated:** Article + FAQPage + BreadcrumbList + Organization JSON-LD. Canonical link. Compressed images with alt text.
- **Word count floor: ~800 words** (with section omission, thin pages still publish if data supports it).

## 7. The ask

Suggest **5-10 distinct page types** that would:

1. **Capture distinct search intent** from the audience above (don't duplicate what we have)
2. **Auto-build from the data sources in section 5** (no human-in-the-loop required, beyond reviewing outputs)
3. **Fit Noruma's positioning** as live-execution copilot (each should have a CTA path back to the product)
4. **Compound with our existing data** — if a new page type can be built from data we already have for sales-interview-prep pages (i.e., zero additional sourcing cost), that's a strong signal

For each page type you suggest, give:
- **URL pattern** (e.g. `/compare/<a>-vs-<b>/<role>`)
- **Search intent it captures** (one sentence)
- **Estimated total page count** at full scale (e.g. "30 company pairs × 6 roles = 180 pages")
- **Data sources** required (tied back to section 5)
- **Why it fits the funnel** (why this audience clicks → considers Noruma)
- **Risk / friction** (anything that would make it brittle, low-quality, or hard to scale)

Rank your suggestions by expected SEO value × buildability. Top suggestion should be the one with the best return per unit of engineering work.

Bias toward page types that:
- Have clear, frequent search queries (high traffic)
- Have data we already have or can extract cheaply (low build cost)
- Naturally cross-link to our existing sales-interview-prep pages (compounding internal SEO)
- Fit the funnel — paid sales execs in active job search

Avoid suggesting:
- Generic content marketing (blog posts, thought leadership) — different SEO play, different engine
- Anything that requires our private corpus or human writing
- Anything that would expose competitors by name
- Anything that requires paid data (DataForSEO, Ahrefs, etc.)
