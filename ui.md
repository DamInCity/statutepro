# Legal CMS — UI/UX Source of Truth (Light + Dark)

## 1) Product Feel (Non-Negotiable)
- Calm, premium, legal-professional SaaS.
- Clean information hierarchy first; visual effects second.
- Motion is subtle and purposeful.
- No noisy gradients, no neon, no heavy shadows, no visual clutter.

## 2) Theme Tokens

### Light Theme
- `--bg`: `#f6f8fc`
- `--surface`: `#ffffff`
- `--surface-muted`: `#f3f6fb`
- `--border`: `#dbe3ee`
- `--text-strong`: `#0b1220`
- `--text`: `#101828`
- `--text-muted`: `#475467`
- `--accent`: `#2f6ef2`
- `--accent-soft`: `rgba(47, 110, 242, 0.12)`

### Dark Theme
- `--bg`: `#060b16`
- `--surface`: `#101826`
- `--surface-muted`: `#0d1524`
- `--border`: `#243247`
- `--text-strong`: `#f7faff`
- `--text`: `#e5ebf7`
- `--text-muted`: `#9baac2`
- `--accent`: `#72a0ff`
- `--accent-soft`: `rgba(114, 160, 255, 0.2)`

## 3) Typography and Layout Rules
- Apple-first font stack: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, `SF Pro Display`, fallback sans.
- Page title: 24–30px / 650.
- Section title: 20–22px / 620.
- Body text: 15px / line-height 1.6.
- Desktop shell: fixed sidebar (~268px), sticky header (~68px), consistent section spacing (24px–32px).
- Mobile shell: off-canvas sidebar toggled from header menu.

## 4) Theme Behavior
- Theme toggle button in header.
- Root element uses `data-theme="light|dark"`.
- Persist theme in local storage.

---

. Define the overall vibe in plain language
Start with a short, non‑negotiable style paragraph:
Overall style
Modern, sophisticated SaaS dashboard.


Dark or dimmed neutral background, subtle gradients only.


Feels calm and professional first, “wow” second.


Motion is smooth and understated, no bouncy or gimmicky effects.


Visual noise must be minimal; typography and spacing do most of the work.


Explicitly ban the gaudy stuff:
Do NOT use: rainbow gradients, neon glows, massive drop shadows, heavy textures, animated backgrounds, or “glass everywhere”.

2. Narrow how glassmorphism is allowed
Glass is where dashboards get heavy if you’re not strict. Tell the agent exactly how glass cards work:
Glassmorphism rules
Glass is only for surface layers: top nav, side nav, floating filters, and “highlight” summary cards.


Background: one simple gradient or solid color, no images.


Glass card style (example, can be Tailwind/CSS in your stack):


Background color: white or slate with 6–10% opacity.


Backdrop blur: blur(10px) max.


Border: 1px solid with 12–18% white/neutral.


Shadow: either none or one very soft shadow (e.g. 0 18px 45px rgba(0,0,0,0.35)), not both strong shadow + strong blur.


Never apply glass to large data tables or entire pages; only to tiles and overlays.


Text on glass must have high contrast and never drop below 90% opacity.


Then show the exact class/utility pattern you want the agent to reuse, e.g.:
tsx
// example “glass card” base class description for the agent
<div className="glass-card">
  ...
</div>

and define it once in your CSS:
css
.glass-card {
  background: rgba(15, 23, 42, 0.6); /* slate-ish, low opacity */
  border: 1px solid rgba(148, 163, 184, 0.35);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.45);
  border-radius: 16px;
}

Then tell the agent: “All cards that should look premium must use glass-card; do not invent new glass styles.”

3. Keep performance under control in the brief
You can make the agent guard performance for you:
Performance constraints
Use only CSS for blur, gradients, and shadows; no canvas/WebGL, no heavy SVG filters.


Limit blur radius to 10–12px maximum and apply only to small/medium containers, not full viewport layers.


Avoid large background images; use pure CSS gradients or solid colors.


No infinite animations; any animated element must have short, purposeful transitions only.


Prefer GPU‑friendly transforms (translate, opacity, scale) over animating layout properties (width, height, top, left).


You can also say:
The design must feel smooth on a mid‑range laptop; avoid any effect that would cause noticeable lag when scrolling a dashboard with several charts.

4. Specify motion and scrolling behavior
Instead of “smooth scrolling and animations”, give it a motion system:
Motion & scrolling
Use smooth scrolling for page transitions and section jumps.


Scroll behavior: no parallax; content should move at normal scroll speed to preserve clarity.


Use subtle motion in these cases only:


Cards entering: fade + slight upward translate (e.g. opacity 0→1, translateY 8px→0).


Hover on primary cards/buttons: very small scale (1 → 1.02) and soft shadow change.


Expanding panels (e.g. drilldown): card gently grows into place, not from full‑screen overlay.


Duration guidelines:


Micro‑interactions: 150–220ms.


Larger panel transitions: 220–280ms.


Easing: use one standard ease (e.g. cubic-bezier(0.22, 0.61, 0.36, 1)) everywhere.


Then instruct:
Do not use exaggerated spring animations, bounce, or overshoot. Transitions should feel confident and restrained.

5. Lock in typography and layout hierarchy
Professional dashboards get their “sublime” feel mostly from type, spacing, and grids.
Tell the agent:
Typography
One font family only, humanist sans (e.g. Inter / SF / system).


Scale:


Page title: 24–28px, semi‑bold.


Section title: 18–20px, medium.


Card title: 16px, medium.


Body text: 14–15px, regular.


Use weight and size for hierarchy instead of many borders and backgrounds.


Limit emphasis: at most one highlight per card (e.g. the main KPI).


Layout
Use a 12‑column grid for desktop.


Maintain generous vertical spacing: 24–32px between sections, 16–20px inside cards.


Use consistent border radius (e.g. 12–16px) across all cards and inputs.


Keep at most 3 levels of depth: background, content cards, top overlays (modals/nav).



6. Give the agent a concrete component contract
For React/TSX, you want predictable components the agent can fill in without re‑inventing structure each time:
Components to implement
DashboardShell (top nav, sidebar, content area).


KpiCard (small stats with optional trend).


SectionHeader (title + optional actions/filter).


DataPanel (larger card with chart or table).


FilterBar (glassmorphed floating bar).


Rules:
All cards use the shared glass-card style.


All panels share padding, radius, and shadow from the design tokens.


Do not introduce new component types without explicit instruction.


You can also force it to separate presentational and data logic:
Presentational components accept fully formatted data (labels, values, colors) and do not fetch or compute.


Container components (e.g. DashboardPage) handle data fetching and pass typed props down.



7. Example wording you can paste to brief the agent
You could combine the above into something like:
You are designing a modern, sophisticated analytics dashboard that feels like a premium SaaS product. The visual style must be calm, minimal, and professional, with selective “wow” moments using controlled glassmorphism and subtle motion.
Follow these non‑negotiable rules:
Use a dark, neutral background with a very soft gradient. No photos or busy textures.


Apply glassmorphism only to navigation, filter bars, and key summary cards, using the shared glass-card style. Do not make big tables or entire pages glass.


Keep performance high: no heavy backgrounds, no large blur on full‑screen elements, no infinite or bouncy animations. All transitions must use opacity and transform only.


Use one clean sans‑serif font and rely on size and weight for hierarchy. Limit decorative borders and backgrounds.


Implement the dashboard using the following React + TypeScript components: [list]. Keep presentational components dumb and typed. 


Your output should be:
React + TypeScript components implementing DashboardShell, KpiCard, SectionHeader, DataPanel, and FilterBar.


CSS (or utility classes) that define the background, glass-card, typography scale, and motion tokens.


Do not invent new colors, fonts, or visual effects beyond what is specified. If a decision is not defined, choose the simplest, most minimal option.

If you want, tell me: dark vs light, primary accent color, and whether this is more “fintech serious” or “creative analytics”, and I can turn this into a tighter, copy‑paste‑ready .md spec tuned to your exact vibe.

