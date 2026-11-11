# FoodWise Prototype

Build a responsive, clickable FoodWise dashboard from the uploaded brief, using clearly marked demo records and browser-local persistence for prototype changes.

## Experience
- Replace the placeholder home screen with an overview dashboard and responsive navigation for all eight requested sections.
- Add meal entry with date-derived weekday, non-negative measurements, served-versus-expected warning, and optional donation creation only after an explicit food-safety confirmation.
- Add donation listings, searchable/filterable discovery, claim and collection status transitions, and donation history.
- Add analytics, impact reports, rule-based sample recommendations, and responsible-use guidelines that distinguish listed surplus from collected food and avoid unsupported impact claims.

## Technical approach
- Keep the demo frontend-only; persist user-created meal and donation records in local storage and seed visibly labelled sample records.
- Implement the app as a focused dashboard experience with shared navigation and reusable form, status, and metric patterns.
- Use semantic design tokens, existing UI controls, accessible responsive behavior, and the existing test setup; test metric separation and food-safety gating.
- Give the home route unique app-specific social metadata and verify the primary demo workflows and all navigation views.
