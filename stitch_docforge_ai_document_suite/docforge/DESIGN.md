---
name: DocForge
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-xs: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  stack-xl: 48px
---

## Brand & Style

The design system is engineered for a premium, AI-driven SaaS environment, balancing the utility of a high-performance editor with the elegance of a professional workspace. The aesthetic is rooted in **Minimalism** with a **Glassmorphic** layer, prioritizing clarity, focus, and a sense of "intelligent air."

The interface aims to evoke a feeling of "calm productivity" and "effortless precision." By utilizing generous whitespace and a restricted but vibrant color palette, the UI disappears to let the user's content and AI-generated insights take center stage. The style is highly polished, mirroring the functional sophistication found in modern tools like Linear and Vercel.

## Colors

The palette is anchored by a deep Indigo primary and a Violet accent, designed to signify intelligence and action. 

- **Primary & Accent:** Use the primary Indigo for main actions and the Violet accent for AI-enhanced features or special highlights.
- **Neutral Scale:** The background uses a cool Slate tint (#F8FAFC) to differentiate from the pure white surface containers (#FFFFFF), creating a subtle layered effect.
- **Semantic Colors:** Success Green is used sparingly for confirmations and status indicators to maintain the minimal aesthetic.
- **Text Hierarchy:** High-contrast Slate-900 (#0F172A) provides maximum readability for primary content, while Slate-500 (#64748B) is reserved for metadata and secondary labels.

## Typography

This design system employs a dual-font strategy. **Manrope** is used for headings to provide a modern, slightly rounded, and premium character. **Inter** is used for body copy and UI labels for its exceptional legibility and systematic feel.

- **Scale:** Headings utilize tight letter-spacing to appear more cohesive at large sizes. 
- **Hierarchy:** Use `label-sm` for overlines or category badges, and `body-lg` for the primary document editing experience to reduce eye strain.
- **Editorial Feel:** In the document editor, ensure a line-height of 1.6x for body text to maintain a spacious, breathable reading environment.

## Layout & Spacing

The system follows a strict **8px grid** rhythm. Layouts are primarily fluid within a 12-column system, but certain dashboard elements use a fixed sidebar (280px) and a flexible content area.

- **Editor Layout:** Centered, fixed-width content column (800px) for maximum focus, with floating or sidebar-bound AI tools.
- **Dashboard Layout:** Utilizes a standard 12-column grid with 24px gutters.
- **Vertical Spacing:** Use `stack-xl` (48px) to separate major sections, and `stack-md` (16px) for internal component spacing.
- **Breakpoints:** 
    - Mobile: < 640px (1 column)
    - Tablet: 641px - 1024px (2-6 columns)
    - Desktop: 1025px+ (12 columns)

## Elevation & Depth

Hierarchy is established through **Ambient Shadows** and **Glassmorphism**, rather than heavy borders or dark colors.

- **Levels of Depth:**
    - **Base:** Background (#F8FAFC) - the canvas.
    - **Surface:** Main containers and cards (#FFFFFF) with a soft 1px border (#E2E8F0) and a subtle shadow.
    - **Floating:** Modals, AI tooltips, and popovers utilize a backdrop blur (12px) and a semi-transparent white fill (85% opacity) to create a premium "glass" effect.
- **Shadow Profile:** Use multi-layered, low-opacity shadows. For example: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`. This ensures elements feel lifted but integrated.

## Shapes

The shape language is "Soft Rounded," leaning towards the larger side of the spectrum to feel friendly and modern.

- **Standard Radius:** 12px for standard cards and buttons.
- **Large Radius:** 16px - 24px for major dashboard containers and modal windows.
- **Pill Shape:** Used exclusively for tags, status badges, and the primary "AI trigger" button to distinguish it from standard UI actions.

## Components

### Buttons
- **Primary:** Solid #4F46E5 background, white text, 12px border radius.
- **Secondary:** Ghost style with a 1px #E2E8F0 border and a subtle hover lift.
- **AI Action:** Gradient fill (Primary to Accent) with a slight purple outer glow on hover.

### Input Fields
- **Style:** Minimalist borders (1px #E2E8F0), 12px radius. Focus state uses a 2px Indigo ring with 20% opacity. 
- **Editor Input:** Borderless with a light grey placeholder that vanishes on focus, emphasizing a "clean slate."

### Cards
- **Dashboard Cards:** White background, 1px border, 16px radius, and a soft shadow. Padding should be a minimum of 24px (`stack-lg`).

### Lists
- **Dashboard Lists:** Clean rows separated by 1px #F1F5F9 lines. Hover states should use a subtle #F8FAFC background change.

### Progress & Status
- **Success Badge:** Soft green background (10% opacity) with #10B981 text.
- **AI Loading:** A subtle, shimmering animated gradient line rather than a traditional spinner.

### Specialized Components
- **Floating Toolbar:** A glassmorphic bar that appears over highlighted text in the editor, featuring 12px rounded corners and a 16px backdrop blur.
- **Contextual AI Sidebar:** A slide-over panel with a pure white surface and distinct Manrope headings to organize AI suggestions.