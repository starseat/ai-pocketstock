---
name: PocketStock
colors:
  surface: '#f7f9ff'
  surface-dim: '#d7dadf'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f9'
  surface-container: '#ebeef3'
  surface-container-high: '#e5e8ee'
  surface-container-highest: '#e0e3e8'
  on-surface: '#181c20'
  on-surface-variant: '#444656'
  inverse-surface: '#2d3135'
  inverse-on-surface: '#eef1f6'
  outline: '#747687'
  outline-variant: '#c4c5d8'
  surface-tint: '#1f4beb'
  primary: '#0a40e2'
  on-primary: '#ffffff'
  primary-container: '#375dfb'
  on-primary-container: '#f1f1ff'
  inverse-primary: '#b9c3ff'
  secondary: '#4b5a9f'
  on-secondary: '#ffffff'
  secondary-container: '#a3b2fe'
  on-secondary-container: '#334286'
  tertiary: '#983500'
  on-tertiary: '#ffffff'
  tertiary-container: '#c14500'
  on-tertiary-container: '#ffefe9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee1ff'
  primary-fixed-dim: '#b9c3ff'
  on-primary-fixed: '#001257'
  on-primary-fixed-variant: '#0033c1'
  secondary-fixed: '#dee1ff'
  secondary-fixed-dim: '#b9c3ff'
  on-secondary-fixed: '#001257'
  on-secondary-fixed-variant: '#334186'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#f7f9ff'
  on-background: '#181c20'
  surface-variant: '#e0e3e8'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 24px
  card-gap: 16px
---

## Brand & Style

The design system is engineered for a premium, high-end fintech experience that prioritizes clarity, trust, and effortless navigation. It balances the precision required for financial data with a welcoming, beginner-friendly interface inspired by the "Super-App" aesthetic.

The visual direction follows a **Modern Glassmorphic** style. It utilizes deep layering, soft background blurs, and expansive whitespace to reduce cognitive load. The emotional response should be one of "calm confidence"—making the complexities of the stock market feel manageable and sophisticated. Key characteristics include translucent surfaces, vibrant but soft accents, and a focus on tactile interaction.

## Colors

This design system employs a refined palette that deviates from traditional harsh trading reds and greens to more sophisticated pastel-influenced tones.

- **Primary Blue:** A vibrant, deep blue used for primary actions, focus states, and branding.
- **Bullish (Red):** A soft, warm pastel red (#FF6B6B) used for upward trends and positive growth, following the KRX standard.
- **Bearish (Blue):** A soft, cool pastel blue (#4DABF7) used for downward trends and losses.
- **Surface & Background:** The base layer is a very light gray (#F8F9FA), allowing the white, semi-transparent glassmorphic cards to sit prominently above it.

## Typography

The typography system uses a pairing of **Outfit** for headings to provide a modern, geometric feel, and **Inter** for body and functional text to ensure maximum legibility and a systematic look.

Hierarchy is maintained through significant weight shifts rather than just size. For financial figures, use `Medium` or `SemiBold` weights of Inter to ensure numbers are easily scannable. All Korean text should be rendered with optimized line-heights (minimum 1.5x for body text) to ensure clarity of complex characters.

## Layout & Spacing

The layout utilizes a **Fluid Grid** with generous margins to create an "airy" feel. 

- **Desktop:** 12-column grid with 24px gutters and a maximum container width of 1440px.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.
- **Spacing Rhythm:** Based on a 4px baseline. Components use 16px (4x) and 24px (6x) padding internally to maintain the "large and soft" aesthetic. 

Layouts should prioritize vertical stack scanning for mobile stock lists and horizontal modularity for desktop dashboard widgets.

## Elevation & Depth

Depth is the defining characteristic of this design system. It is achieved through **Glassmorphism** and **Ambient Shadows** rather than traditional solid fills.

- **Background Blur:** Glassmorphic cards use a `backdrop-filter: blur(20px)` with a white fill at 70-80% opacity.
- **Shadows:** Use extremely soft, diffused shadows with a large spread and low opacity (e.g., `box-shadow: 0 10px 30px rgba(0,0,0,0.04)`).
- **Z-Index Layers:**
    - Level 0: Background (#F8F9FA).
    - Level 1: Glassmorphic Cards (The primary workspace).
    - Level 2: Modals, Pop-overs, and Floating Action Buttons.

## Shapes

The shape language is "Extra Rounded" to evoke a friendly, modern, and approachable feel. 

- **Cards:** Use a minimum radius of 24px. For larger dashboard widgets, this can scale to 32px.
- **Buttons & Inputs:** Follow a "Soft" to "Pill" transition. Action buttons are often fully pill-shaped (rounded-full) to stand out against the more structured card corners.
- **Charts:** Line chart vertices should be slightly smoothed (monotone interpolation) to avoid aggressive spikes.

## Components

### Buttons
- **Primary:** Pill-shaped, Primary Blue fill with white text. High-elevation shadow.
- **Secondary:** White glassmorphic background with Primary Blue text and a subtle 1px border.

### Cards
- The central component. Must include 24px internal padding, `backdrop-blur`, and a subtle 1px white border (inner glow) to define edges against light backgrounds.

### Inputs
- **Search:** Subtle, light-gray filled fields with 12px rounding and icons for clarity.
- **Numeric:** Large, clear typefaces with "plus/minus" steppers that use high-contrast touch targets.

### Charts
- **Candlestick:** Pastel Red (#FF6B6B) for up, Pastel Blue (#4DABF7) for down. Use thin 1px wicks.
- **Line Charts:** Use a 2px stroke width with a soft gradient area fill underneath (10% opacity of the line color).

### Toggles & Tabs
- **Sliding Pill:** A background track with a high-contrast white "floating" pill that moves to indicate the active state.
- **Status Chips:** Small, rounded chips for "Market Open" or "Volatile" markers using 10% opacity fills of the respective trend colors.