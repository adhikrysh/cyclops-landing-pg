# De-vibecoding the Cyclops landing page — design

**Date:** 2026-06-10
**Status:** Implemented on localhost for review (uncommitted, per iterate-then-push workflow)

## Problem

Repeated visitor feedback: the site reads as "obviously vibecoded / done by Claude."
The goal is for it to read as painstakingly crafted. The converged design direction
(dark `#07090d`, white hairline grid, Michroma brand + Chakra Petch everything else,
solid red CTAs, serious sci-fi tone) is **not** the problem and is preserved exactly.
The tells are in the copy, the stamped structure, and missing craft details.

## Diagnosis — what reads as AI-generated

**Copy tells (highest signal):**
- Em dashes in nearly every sentence (hero, banner, sections 1 and 3).
- The triad meta-frame: "fails — in one of three ways."
- Formulaic section naming: "The Radio Problem / The Weather Problem / The Site
  Diversity Problem."
- Italicized *always-on* in the hero headline; `<strong>` bolded keywords mid-sentence.
- "The X for Y." headline formula; "at scale" twice.

**Structure tells:**
- Three identically stamped sections (same 1fr/1.12fr grid, same header scale, same
  rhythm). Template feel.
- The page states three problems and ends. No section presents the solution as a
  system. A founder-built site would land the answer hard.
- Footer is a bare CTA + copyright.

**Craft gaps:**
- Unicode arrow entities (`↗`, `→`, `←`) used as icons.
- No figure annotation system despite four technical visualizations.
- No tabular numerals on stats, no selection styling, no meta description.

## Approaches considered

- **A. Voice + structure + craft pass (chosen).** Keep the aesthetic; rewrite all copy
  in declarative founder voice, add a solution/spec-sheet section, differentiate the
  three beats, add engineering-document details (FIG annotations, drawn SVG arrows,
  tabular numerals, denser footer). Lowest risk, attacks every identified tell.
- **B. Full visual redesign.** Rejected: abandons a direction the user deliberately
  converged on in June 2026; the aesthetic isn't the complaint driver.
- **C. Copy-only pass.** Rejected: cheap, but leaves the stamped-template structure
  and the missing-solution-section problem intact.

## Design

### Copy deck (all em dashes removed, no triads, no inline bold/italic emphasis)

| Slot | New copy |
|---|---|
| Hero H1 | "Move the ground station above the weather." |
| Hero sub | "Cyclops holds a laser relay at 20 km on a tether, two kilometres above the cloud layer. The link to orbit stays optical and stays up: 99.999% availability, in any climate." |
| Sticky banner | "Orbital compute has a downlink problem. Nothing flying today solves it." |
| S1 head | "Radio can't carry it." |
| S1 body | "Spectrum is licensed in slivers and shared with everyone else in the sky. A radio downlink tops out near 2 Gbps. An orbital data centre running inference needs a hundred times that." |
| S2 head | "Lasers die in cloud." |
| S2 body | "Optical solves bandwidth and inherits weather. A single cloud layer between the telescope and the sky takes the link to zero, and no amount of engineering on the ground changes that. Availability becomes a property of the local climate." |
| S3 head | "More ground stations don't fix it." |
| S3 body | "Weather is regional, so spare sites have to be far apart. When a front parks over one station, traffic reroutes 1,900 km to a clear one and picks up over 50 ms of backhaul. Inference traffic can't ride that." |
| S4 head (new) | "Above the cloud line, the sky is always clear." |
| S4 body | "Cyclops parks the receive telescope at 20 km on a tethered platform, above the weather entirely. The beam from orbit lands in clear sky every hour of the year, and the tether brings it the rest of the way down. The forecast stops mattering." |
| Contact H1 | "Talk to the founders." |

Every number is already on the site (20 km / 18 km cloud layer / 550 km LEO from the
hero SVG; 2 vs 200 Gbps, +52 ms vs +7 ms, 1,900 km from the visualizations; 99.999%
from the hero). Nothing is invented.

### Structure

- **New section `#s4` "The Cyclops Relay"** placed *after* the `.problems` container,
  so the sticky problem banner naturally pushes off-screen as the answer arrives (no
  JS change needed). Full-viewport, copy block + a 4-cell datasheet row:
  RELAY ALTITUDE 20 km / THROUGHPUT 200 Gbps / AVAILABILITY 99.999% / ADDED LATENCY +7 ms,
  each with a grounded sub-caption. Pure typography, no visualization: the restraint
  is the point.
- **Flip section `#s2`** (scene left, copy right) on desktop via CSS order, giving an
  A-B-A editorial rhythm instead of a stamped template. Mobile stacking order unchanged.
- **Index marks** become editorial: `01 / RADIO`, `02 / WEATHER`, `03 / SITE DIVERSITY`,
  `04 / THE CYCLOPS RELAY`.

### Craft details

- **FIG annotation system:** small mono tags on each visualization
  (FIG. 01 tethered relay, FIG. 02 throughput, FIG. 03 weather cycle, FIG. 04 reroute
  penalty), consistent with an engineering document.
- **Drawn SVG arrows** replace `&#8599;`/`&rarr;`/`&larr;` entities in nav, footer CTA,
  and the contact back-link (1.5px stroke, matches hairline weight).
- **Tabular numerals** on all stat/value classes (counters no longer jitter).
- **`::selection`** in brand red.
- **Meta description** added.
- **Footer densified:** CTA + email link left; brand mark + copyright right.
- Removed now-unused `.h1 em` / `.p strong` rules (no remaining usages).

### Constraints honored

- Canvas/SVG code untouched except where copy appears; all fonts already
  Chakra Petch (exhaustive-sweep rule checked).
- Desktop must not regress; verify at 1440 px and 390 px with screenshots.
- Everything stays uncommitted until user reviews on localhost:8742 and says "push".

## Verification plan

1. Serve `public/` on localhost:8742.
2. Screenshot every section at 1440×900 and 390×844.
3. Console clean; click-through to /contact and back.
4. Grep for remaining `&mdash;`/`—` in copy, leftover Unicode arrows, `<strong>`/`<em>`
   in body copy.
