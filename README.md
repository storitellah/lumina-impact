# LUMINA Impact

**Intelligent procurement radar, opportunity tracker & tender terminal for visual‑media agencies, documentary filmmakers, photojournalists and humanitarian storytellers.**

LUMINA Impact monitors, scrapes, verifies and classifies visual‑media opportunities focused on **development, humanitarian response and impact storytelling** — beneficiary case studies, climate‑resilience documentaries, emergency response visual kits, SDG progress reports and donor visual assets — with prioritized routing for **East Africa, West Africa and Pan‑Africa**.

---

## Monorepo layout

```
lumina-impact/
├── frontend/        Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion — Apple‑HIG UI
├── backend/         FastAPI · SQLAlchemy · BullMQ‑style job schema · scraping pipeline
└── README.md
```

### Frontend — `frontend/`

Apple Human‑Interface‑Guidelines terminal: glassmorphic translucency, SF Pro typography,
segmented controls, high‑contrast dark/light mode and fluid Framer Motion micro‑interactions.

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

The frontend ships with a **mock dataset of 8 realistic impact tenders** (`lib/mock-data.ts`)
served through an internal API route (`app/api/opportunities/route.ts`) so the terminal is fully
interactive without a running backend. Point it at the live backend by setting
`NEXT_PUBLIC_API_BASE`.

**Deploying?** See [`DEPLOYMENT.md`](./DEPLOYMENT.md) — the frontend deploys to
**Cloudflare Workers** via the OpenNext adapter (`npm run cf:deploy`).

Key surfaces:

| Surface | File |
| --- | --- |
| Terminal shell / layout | `app/page.tsx` |
| Top bar (search, region switcher, alert center) | `components/TopBar.tsx` |
| Segmented category nav | `components/SegmentedNav.tsx` |
| Filter & refinement bar | `components/FilterBar.tsx` |
| Opportunity feed + cards | `components/OpportunityFeed.tsx`, `OpportunityCard.tsx` |
| Detail sheet (brief, TOR, export) | `components/DetailSheet.tsx` |
| Live countdown | `components/Countdown.tsx` |
| State management (Zustand) | `store/useOpportunityStore.ts` |
| Credibility / match scoring | `lib/scoring.ts` |

### Backend — `backend/`

FastAPI orchestration layer for the distributed crawler + AI extraction/verification engine.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000/docs
```

| Concern | Module |
| --- | --- |
| API surface | `app/main.py` |
| Pydantic schemas (the verified‑fact contract) | `app/models/schemas.py` |
| SQLAlchemy storage models + full‑text search | `app/db/models.py` |
| Crawler workers | `app/crawlers/{ungm,reliefweb,google_cse,ingo}.py` |
| AI extraction & verification (anti‑hallucination) | `app/extraction/parser.py`, `pdf_extractor.py` |
| Credibility scoring | `app/scoring/credibility.py` |
| Hourly / daily job queue (BullMQ/Redis contract) | `app/queue/tasks.py` |
| Notifications & dispatch to `hello@storitellah.com` | `app/notifications/dispatch.py` |
| Seed dataset | `backend/seed/mock_tenders.json` |

---

## Data‑ingestion sources

| Tier | Sources |
| --- | --- |
| UN & Multilateral | UNGM (UNSPSC `82131600` cinematography / `82130000` photography), UNICEF, UNHCR, WFP, UNDP, UNFPA, WHO, UN Women, FAO, IOM, World Bank, AfDB, ADB |
| Humanitarian / INGO / Donor | ReliefWeb Consultancies API, Devex, DevelopmentAid, IAPSO, Bond UK, MSF, IRC, Oxfam, Save the Children, Mercy Corps, NRC, Gates, Ford, Rockefeller; USAID, FCDO, GIZ, AFD, JICA |
| Professional / Social | LinkedIn, Twitter/X, African Creative Network, freelance humanitarian media rosters |
| Search automation | Google Custom Search JSON API (TOR / documentary / beneficiary‑photography operators) |

## AI extraction — zero‑guessing contract

Every raw listing / PDF / DOCX attachment passes a strict parser that emits **only explicit, verified
facts**. Missing facts are recorded as `null` — never inferred. See `backend/app/extraction/parser.py`
and the `Opportunity` schema for the full field contract (title, organization, assignment type,
geographic scope + regional tagging, scope of work, budget indicator, submission protocol, deadlines,
and a computed **credibility / match score**).

## Status & badge system

| Badge | Meaning |
| --- | --- |
| 🟢 Verified Impact Assignment | Emerald |
| 🟠 Closing Soon (< 72h) | Amber |
| 🔘 Archived / Historical | Muted slate |
| 🟣 Priority Africa Region | Indigo |
| 🔵 LTA / Retainer Roster | Sky blue |

---

_Dispatch & intelligence routing target: `hello@storitellah.com`._
