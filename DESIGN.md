# Design System Document: The Structural Monolith

## 1. Overview & Creative North Star
**Creative North Star: The Structural Monolith**

This design system is engineered to mirror the precision, gravity, and high-performance nature of high-end facade rehabilitation. We are moving away from the "generic corporate" look and into a world of **Industrial Cinematicism**. The experience should feel like looking at a high-end architectural blueprint or a luxury skyscraper at dusk: authoritative, heavy, yet technologically advanced.

To break the "template" feel, we employ **intentional asymmetry**. Layouts should not be perfectly centered; they should use wide-reaching grids where elements might be anchored to the far left or right, leaving massive "voids" of white space (or in our case, "dark space"). Overlapping typography and containers will create a sense of structural depth, suggesting that the interface itself is a piece of engineered construction.

---

## 2. Colors & Surface Philosophy

### The Palette
We utilize a monochromatic dark base to establish authority, punctuated by `primary_container` (#f2994a) to represent "Technical Orange"—the color of industrial safety, sparks, and precision machinery.

*   **Surface (`#131314`):** Our foundation. It is not a flat black, but a deep graphite that allows for "shadows" to exist.
*   **Primary Accent (`#ffbb84` / `#f2994a`):** Used only for critical actions or to draw the eye to architectural details.
*   **Tertiary Accent (`#5ad9f4`):** Our "Electrical Blue," reserved for data, technical specs, or high-tech engineering callouts.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning. 
Boundaries must be defined by:
1.  **Tonal Shifts:** Placing a `surface_container_low` section against a `surface` background.
2.  **Negative Space:** Using the spacing scale to create a physical gap that the eye interprets as a boundary.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of metal and glass. 
*   **Base:** `surface`
*   **Layer 1:** `surface_container_low` (Subtle depth)
*   **Layer 2:** `surface_container_high` (Interactive elements/Cards)
*   *Nesting Tip:* A `surface_container_highest` card should only sit on a `surface_container_low` background to ensure the tonal "lift" feels natural.

### The "Glass & Gradient" Rule
To avoid a "flat" industrial look, use **Glassmorphism** for floating navigation and overlays. Use `surface_container` tokens with a 60-80% opacity and a `20px - 40px` backdrop-blur. 
*   **Signature Texture:** Main CTAs should use a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle to mimic the sheen of coated steel.

---

## 3. Typography
Our typography is our architecture. We use a high-contrast scale to create an editorial feel.

*   **Display (Space Grotesk):** This is our "Structural" font. Use `display-lg` (3.5rem) for hero statements. The geometric nature of Space Grotesk feels engineered and modern.
*   **Headings (Space Grotesk):** `headline-lg` and `headline-md` should be used for section titles, often set in all-caps with slight letter spacing (+0.05em) to increase authority.
*   **Body (Inter):** The "Utility" font. Inter provides maximum legibility for technical descriptions and rehabilitation processes.
*   **Labels (Inter):** Used for technical specs, dimensions, and breadcrumbs. Often paired with `tertiary` (#5ad9f4) to look like blueprint annotations.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering**. Avoid shadows where color shifts can do the work. 
*   **Stacking:** A `surface_container_lowest` card on a `surface_container_low` section creates a "recessed" look, like an inset panel in a facade.

### Ambient Shadows
When an element must "float" (e.g., a modal or a primary CTA dropdown), use an **Ambient Shadow**:
*   **Blur:** 40px - 60px.
*   **Opacity:** 8% - 12%.
*   **Color:** Use the `primary` token color for the shadow if the element is active, otherwise use a tinted version of `on_surface`.

### The "Ghost Border" Fallback
If a border is required for accessibility, it must be a **Ghost Border**:
*   Use `outline_variant` at **15% opacity**. It should be barely visible—enough to catch the light, not enough to define a hard edge.

---

## 5. Components

### Buttons (Industrial Grade)
*   **Corner Radius:** Strict `0px`. Roundness suggests softness; we are building skyscrapers.
*   **Primary:** Background `primary_container`, text `on_primary_container`. On hover, transition to `primary`.
*   **Secondary:** Background `transparent`, Ghost Border (20% opacity), text `on_surface`.
*   **States:** Transitions must be instant (150ms) to feel "mechanical" and responsive.

### Inputs & Forms
*   **Field Style:** Use `surface_container_lowest` as the fill. 
*   **Active State:** No glow. Instead, change the bottom border to 2px `primary`.

### Cards & Lists
*   **Strict Rule:** No divider lines. 
*   **Separation:** Use `surface_variant` backgrounds to separate list items, or simply use `16px` to `24px` of vertical white space.
*   **Industrial Lists:** For technical specs, use `label-md` in `tertiary` (Blue) to label data points, creating a "technical readout" vibe.

### Signature Component: The "Facade Card"
A high-end card used for project portfolios.
*   **Image:** 100% width, grayscale by default, transitions to color on hover.
*   **Overlay:** A `surface_container_highest` glassmorphism tag in the bottom left corner containing the project name in `title-sm`.

---

## 6. Do's and Don'ts

### Do
*   **DO** use strict `0px` radii for everything.
*   **DO** use wide margins (80px+) to let the "Monolith" breathe.
*   **DO** use `surface_container` tiers to create hierarchy.
*   **DO** use `display-lg` typography as a decorative element, even if it's partially cut off by the screen edge (Editorial style).

### Don't
*   **DON'T** use 100% opaque borders to separate sections.
*   **DON'T** use any rounded corners (not even 2px).
*   **DON'T** use generic drop shadows; they break the "clean engineering" feel.
*   **DON'T** use bright colors outside the `primary` and `tertiary` technical tokens.

---

## 7. Spacing Scale
The spacing should feel intentional and rhythmic.
*   **Macro Spacing (Sections):** 128px, 192px.
*   **Micro Spacing (Elements):** 8px, 16px, 24px, 32px.
*   Always favor "too much" space over "too little." A premium brand is never crowded.