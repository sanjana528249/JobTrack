## KodNest Premium Build System — Design System

This repository contains the **KodNest Premium Build System** design language. It is intended for a serious B2C SaaS product, not a student or hackathon project.

### Design philosophy

- **Calm**: Off‑white backgrounds, restrained typography, minimal chrome.
- **Intentional**: Every element supports a clear decision or next step.
- **Coherent**: One layout skeleton, one component language, no visual drift.
- **Confident**: Strong serif headings, clear hierarchy, no decorative noise.

### Global layout

Every page follows the same vertical structure:

1. **Top Bar** – project name (left), progress indicator (center), status badge (right).
2. **Context Header** – large serif headline and 1‑line subtext, max 720px width.
3. **Primary Workspace + Secondary Panel** – 70/30 split, cards only, no free‑floating controls.
4. **Proof Footer** – checklist for: UI Built / Logic Working / Test Passed / Deployed, each with proof input.

This structure is implemented in `index.html` via the `kn-topbar`, `kn-context`, `kn-main`, `kn-primary`, `kn-secondary`, and `kn-proof` sections.

### Color system

The system is intentionally restrained and is built around three base colors:

- **Background**: `#F7F6F3`
- **Primary text**: `#111111`
- **Accent**: `#8B0000` (also used for primary actions and error emphasis)

Semantic states (success, warning, error) are expressed using subtle overlays and borders derived from these colors (via `rgba` values) instead of introducing new hex codes, keeping the palette compact and consistent.

### Typography

- **Headings**: `var(--kn-font-heading)` – a classic serif stack (`"Georgia", "Times New Roman", serif`), large with generous spacing.
- **Body**: `var(--kn-font-body)` – a system sans‑serif stack for clarity and performance.
- **Body sizing**: 16px base, line height ~1.7, with text blocks constrained to ~720px where appropriate.

Heading utilities:

- `kn-heading-xl` – page context headline.
- `kn-heading-md`, `kn-heading-sm`, `kn-heading-xs` – section and card titles.

Body utilities:

- `kn-text-md`, `kn-text-sm` – body and helper text.

### Spacing system

All spacing uses the fixed scale defined in `styles.css`:

- `--kn-space-1`: 8px
- `--kn-space-2`: 16px
- `--kn-space-3`: 24px
- `--kn-space-4`: 40px
- `--kn-space-5`: 64px

No ad‑hoc pixel values are introduced for margins or padding; whitespace is a primary design tool.

### Core components

- **Top Bar**: `kn-topbar` with:
  - Project block: `kn-topbar__project`
  - Progress: `kn-topbar__progress`
  - Status badge: `kn-badge kn-badge--status-*`

- **Buttons**:
  - Primary: `kn-button kn-button--primary` (solid accent red)
  - Secondary: `kn-button kn-button--secondary` (outlined, calm neutral fill)
  - Tertiary: `kn-button kn-button--tertiary` (text‑style, minimal)
  - All buttons share the same border radius, font, and 150–180ms `ease-in-out` transitions.

- **Inputs**:
  - Base: `kn-input`
  - Multiline: `kn-input kn-input--multiline`
  - Prompt: `kn-input kn-input--multiline kn-input--prompt`
  - Focus: border and subtle outline in accent color, no heavy shadows.

- **Cards**:
  - Base: `kn-card` with `kn-card__header` and `kn-card__body`
  - Primary/secondary variants tweak layout, not visual style: `kn-card--primary`, `kn-card--secondary`
  - Subtle border, minimal shadow, consistent padding.

- **Alerts / states**:
  - Empty state: `kn-alert kn-alert--empty`
  - Success: `kn-alert kn-alert--success`
  - Error: `kn-alert kn-alert--error`
  - Each explains what happened and what to do next; copy is calm and constructive.

- **Proof footer**:
  - Container: `kn-proof`
  - Items: `kn-proof__item` with checkbox `kn-proof__checkbox` and evidence input `kn-proof__input`.

### Interaction rules

- Transitions are limited to **150–180ms**, using `ease-in-out`.
- No bouncy, spring, parallax, or attention‑seeking animation.
- Hover/focus states rely on subtle background, border, and outline changes only.
- Error and empty states always suggest a next action (e.g., “Add objective”, “Check your connection and try again”).

### Extending the system

When adding new views:

- **Always** keep the top bar, context header, main 70/30 split, and proof footer.
- Reuse `kn-card`, `kn-button`, `kn-input`, and typography utilities; do not introduce new colors or radii.
- Keep copy direct and operational; avoid hype or marketing language in product UI.

No product‑specific features have been implemented yet; `index.html` serves as a reference implementation of the layout and component language for future steps.

