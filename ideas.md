# Country Tools Dashboard — Design Direction

## Three possible directions

### Theme Name: Atlas Editorial
Very Brief Intro: A warm, editorial workspace inspired by field notebooks, cartographic annotations, and public research desks. Paper-like surfaces, ink contrast, and restrained red accents make utility feel considered and human.
Probability: 0.07

### Theme Name: Signal Terminal
Very Brief Intro: A dark operator console with electric chartreuse highlights, compact density, and strong data-led hierarchy. It makes each tool feel like a sharp instrument for fast research.
Probability: 0.03

### Theme Name: Civic Index
Very Brief Intro: A calm civic-information system blending government wayfinding, transit signage, and modern information design. Deep blue, mineral backgrounds, and bright signal orange create trust without feeling corporate.
Probability: 0.06

## Chosen Approach: Civic Index

### Design Movement
Contemporary civic information design with references to Swiss wayfinding, public-service dashboards, and modern cartographic systems. The interface should feel like a reliable urban research desk: clear, purposeful, and quietly distinctive.

### Core Principles
1. **Orient first.** Every tool starts with country context and a clear next action.
2. **Utility with character.** Use typographic contrast, small labels, and mapping cues to make functional modules feel authored rather than generic.
3. **Progressive density.** The landing workspace gives a concise overview, while generated results expand into readable, copyable working surfaces.
4. **Trust through transparency.** Clearly label live-data limitations as frontend demo data and separate generated heuristics from external search destinations.

### Color Philosophy
The foundation is mineral white and deep ink navy: a public-information palette that feels legible in daylight and authoritative without being severe. Signal orange is reserved for actions, active states, and moments that need attention; it reads like a wayfinding marker rather than decoration. A muted teal supports map and trend context. Dark mode inverts the system into midnight ink with warm paper highlights so the product remains calm, not neon.

### Layout Paradigm
Use a persistent left rail as the orientation spine and a wide workspace that alternates between an editorial intro band and asymmetrical tool modules. The main workspace should feel like a desk with pinned instruments: a large country context panel, a compact “live pulse” strip, then a two-column tool matrix with deliberately varied module sizes. Avoid centered marketing blocks; let the sidebar and staggered cards create the composition.

### Signature Elements
- A vertical **country marker rail**: short orange line, country code, and region label used in the header and tool cards.
- **Index tabs** with mono labels such as `01 / TRENDS`, echoing civic filing systems.
- A subtle **coordinate-grid texture** and micro map-line ornament behind section headers, always low contrast.

### Interaction Philosophy
Interactions should feel like operating a dependable field instrument. Country changes propagate instantly across every tool. Generate actions reveal a fresh, visibly varied set of results; copy actions confirm in-place with a short label change and toast. External buttons open the appropriate Google destination in a new tab and remain clearly distinguished from synthetic results.

### Animation
Keep transitions quick and physical: buttons compress to 0.97 on press, cards lift by 2px on hover, and result rows reveal with a 60ms stagger. Use a 180ms ease-out for controls and 240ms for panel entrance. No decorative loops; only a barely perceptible background grid drift in reduced-motion-safe mode. Respect `prefers-reduced-motion` and remove staggered motion when requested.

### Typography System
Use **DM Sans** for readable interface copy and **Space Grotesk** for titles and numeric emphasis. Use **IBM Plex Mono** for labels, codes, queries, and metadata. H1 is bold and compact, H2 uses a slightly condensed display feel, body copy stays 14–16px with generous line-height, and all uppercase labels receive tracking of at least 0.12em.

### Brand Essence
Country Tools is the fast, transparent research desk for location-aware web work: pick a country, create useful starting points, and move into Google with less friction. Personality: **precise, curious, grounded**.

### Brand Voice
Headlines are direct and quietly confident. CTAs use verbs and explain the next step; microcopy says what is synthetic, what is live, and where the user is going.

Example lines:
- “Start with a country. Leave with a sharper search.”
- “Fresh set generated for Morocco — synthetic prompts, ready for Google.”

### Wordmark & Logo
The mark is a compact **CT monogram formed from two offset map pins**: a vertical orange route line intersects a navy rounded coordinate bracket, creating a recognizable symbol without text. The wordmark pairs a custom-spaced “COUNTRY” in Space Grotesk with a small mono “TOOLS” index label.

### Signature Brand Color
**Signal Orange — #F26A3D.** It is the unmistakable action marker of the system: warm enough to feel human, vivid enough to guide attention, and used sparingly so every orange moment means “go here.”

## Implementation Notes

The application is frontend-only. Google Trends is represented by clearly labelled randomized demo pulse data; the other tools generate deterministic-shape randomized outputs from the selected country. The code keeps tool generators pure and isolated so public APIs can replace the demo functions later without changing the UI contract.

## Style Decisions

- The persistent left rail is the non-negotiable orientation spine: it carries navigation, country context, section route cues, and the frontend-mode note.
- The Country Tools identity always combines the CT map-pin mark with the custom-spaced COUNTRY / TOOLS lockup; plain text naming is not used alone.
- Primary actions describe the operation and destination in the brand voice: build trend set, make synthetic addresses, build map queries, build public queries, Google search, and Google Maps.
