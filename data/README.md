# `data/` — operational scaffolding for the SEO engine

This directory is the runtime workspace for the programmatic `sales-interview-prep` pipeline. Skills live at `~/.claude/skills/seo-engine/` (not in this repo); skills read and write the files here.

## What's committed

- **`seed-companies.json`** — curated company × role queue input. Skill #1 reads this to refill `target_queue`. Edit to change which companies the engine targets. Add entries with priority hints; the engine will not re-enqueue a slug that's already published in the last 30 days.
- **`README.md`** — this file.
- **`.gitignore`** — see below.

## What's gitignored (local-only, per-machine state)

- `seo-engine-state.json` — canonical machine state. Queue, counters, in-flight target, `auto_pause_reason`. Skill #1 initializes on first run if missing; updates at end of every run.
- `seo-engine-status.md` — auto-regenerated human-readable summary of state. Read this when curious; never edit by hand (overwritten next run).
- `companies/<company>/<role>.json` — sourced data from skill #2 (Reddit, RepVue, Wayback, YouTube transcripts).
- `distribution/<company>-<role>.md` — distribution drafts from skill #6 (LinkedIn post, Reddit thread suggestions, video outline). Operator reviews; engine never auto-posts.
- `qa-failures/<company>-<role>-<timestamp>.md` — pages that failed `page-qa-gate` after 2 retries. Quarantined from `src/content/`. Inspect to understand why.
- `alerts/<timestamp>.md` — auto-pause and incident notifications. Engine writes; operator clears `auto_pause_reason` in `seo-engine-state.json` after fixing root cause.
- `.scratch/` — transient working files for skill #2 (raw HTML, transcript files). Cleaned at end of run.

## Operator commands

To resume after auto-pause:

1. Read the latest file in `alerts/` to understand why.
2. Fix the root cause (rotate creds, fix a skill bug, edit seed list, etc.).
3. Edit `seo-engine-state.json` and set `"auto_pause_reason": null`.
4. Wait for next cron run, or invoke skill #1 manually.

To reorder the queue:

Edit `seo-engine-state.json` and rearrange `target_queue` entries. The orchestrator processes head of queue first.

## Source data freshness

`seed-companies.json` is a curated list. The engine treats each entry as an idea, not as a spec. Skill #2 verifies RepVue rep counts at scrape time and skips companies with < 20 reviewers (regardless of what the seed file claims). Compensation, process, and questions are pulled live from Reddit + RepVue + Wayback + YouTube every time a page is built.
