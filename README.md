# Automated Job Pipeline

An AI-powered job discovery and aggregation engine that pulls listings from 25+ free APIs and legal scraping sources, deduplicates and normalizes them into a single schema, classifies relevance using Claude Haiku, and stores everything in Supabase for downstream use (search, alerts, dashboards, or a human-in-the-loop application assistant).

Built in a 1-week sprint by a 3-person team

## What this is

- **Job discovery at scale**: aggregates listings from Greenhouse, Lever, RemoteOK, Adzuna, USAJobs, SmartRecruiters, Jooble, Remotive, and ~15 more public APIs, plus a handful of Playwright-based scrapers for sites without APIs (ZipRecruiter, Dice, We Work Remotely, etc.)
- **Google Jobs bridge**: uses DataForSEO/SerpApi to surface LinkedIn- and Indeed-listed roles that appear in Google Jobs, without directly scraping those platforms
- **AI classification**: every job is scored for relevance (tech stack match, recency, English, non-spam) using Claude Haiku with prompt caching to keep costs low
- **Deduplication & normalization**: a single `job_pool` schema with a unique index on `(link, company)`, plus a universal normalizer so every source maps to the same fields
- **Run logging & QA**: every pipeline run is logged (jobs fetched, jobs new, errors), with an automated QA script that audits duplicate rate and null-field rate
- **Cost-conscious**: target of under $79/month by leveraging free-tier APIs and Claude prompt caching (80%+ cache hit rate)

## What this is not

This repo does not include automated mass-submission of job applications, proxy rotation, or browser fingerprint spoofing. The output of this pipeline is a clean, scored, deduplicated job database — what you build on top of it (alerts, a dashboard, a resume-tailoring assistant, a one-click "review and apply" flow) is a separate concern and should respect the Terms of Service of any platform it touches.

## Stack

| Layer | Tool |
|---|---|
| Orchestration | n8n (self-hosted / n8n.cloud) |
| Database | Supabase (Postgres) |
| Job discovery | Greenhouse API, Lever API, RemoteOK, Adzuna, USAJobs, SmartRecruiters, Jooble, Jobicy, Remotive, JSearch (RapidAPI), DataForSEO / SerpApi |
| Scraping (sites without APIs) | Playwright |
| AI classification & extraction | Claude Haiku (Anthropic API) |
| Coding | Claude Code |
