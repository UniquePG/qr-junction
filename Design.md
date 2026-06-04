# QR Junction Design System v1.0
old -> #006EFE 
#0046a1
## Design Philosophy

QR Junction should feel:

* Professional
* Fast
* Reliable
* Trustworthy
* Modern
* Business-focused

It should NOT feel:

* Like an AI startup
* Like a crypto dashboard
* Like a marketing-heavy landing page
* Like a colorful design playground

Users should immediately trust the platform with their QR campaigns, analytics, and business assets.

---

# Design DNA

## 70% Linear

Take from Linear:

* Precise spacing
* Clean layouts
* Minimal borders
* Professional dashboards
* Excellent hierarchy
* Sharp typography
* Subtle interactions
* Consistent component sizing

Avoid:

* Excessive animations
* Fancy gradients
* Decorative UI

---

## 20% Stripe

Take from Stripe:

* Marketing page quality
* CTA hierarchy
* Section layouts
* Trust-building visuals
* Enterprise SaaS presentation

Avoid:

* Large gradients
* Overly colorful illustrations

---

## 10% Notion

Take from Notion:

* Simplicity
* Readability
* Low cognitive load
* Clean content presentation

Avoid:

* Monochrome-only design
* Documentation-heavy appearance

---

# Brand Personality

If QR Junction were a person:

* Calm
* Intelligent
* Reliable
* Professional
* Efficient

Not:

* Loud
* Playful
* Trendy
* Experimental

---

# Color System

## Primary Brand Color

Blue communicates trust, technology, reliability.

```css
Primary Blue: #2563EB
```

---

## Accent Color

Used sparingly.

```css
Accent Cyan: #06B6D4
```

Use only for:

* Hover states
* Analytics highlights
* Progress indicators

Never use as the main brand color.

---

## Text Colors

```css
Heading: #0F172A
Body: #334155
Muted: #64748B
Disabled: #94A3B8
```

---

## Background Colors

```css
Page Background: #FFFFFF
Section Background: #F8FAFC
Card Background: #FFFFFF
Hover Surface: #F1F5F9
```

---

## Border Colors

```css
Default Border: #E2E8F0
Strong Border: #CBD5E1
```

---

## Success Colors

```css
Success: #10B981
Success Background: #ECFDF5
```

---

## Error Colors

```css
Error: #EF4444
Error Background: #FEF2F2
```

---

# Typography

## Font Family

Use Geist everywhere.

Fallback:

```css
font-family:
Geist,
Inter,
sans-serif;
```

---

## Heading Scale

### H1

```css
48px
700
line-height: 56px
```

Used only in hero section.

---

### H2

```css
36px
700
line-height: 44px
```

---

### H3

```css
28px
600
line-height: 36px
```

---

### H4

```css
22px
600
line-height: 30px
```

---

### Body

```css
16px
400
line-height: 26px
```

---

### Small Text

```css
14px
400
line-height: 22px
```

---

# Layout Rules

## Maximum Width

```css
1280px
```

---

## Container Padding

Desktop

```css
32px
```

Tablet

```css
24px
```

Mobile

```css
16px
```

---

## Section Spacing

```css
96px
```

between sections.

Never less than:

```css
72px
```

---

# Border Radius System

Use only these values:

```css
Small: 8px
Medium: 12px
Large: 16px
XL: 20px
```

Never use:

```css
999px
30px
40px
```

for normal cards.

---

# Button System

## Primary Button

Background

```css
#2563EB
```

Text

```css
#FFFFFF
```

Height

```css
44px
```

Radius

```css
12px
```

Weight

```css
600
```

Hover

```css
#1D4ED8
```

---

## Secondary Button

Background

```css
transparent
```

Border

```css
1px solid #E2E8F0
```

Text

```css
#0F172A
```

---

## Danger Button

Background

```css
#EF4444
```

Text

```css
white
```

---

# Card System

Cards should feel like Linear.

## Card

```css
background: white;
border: 1px solid #E2E8F0;
border-radius: 16px;
padding: 24px;
```

---

## Hover

```css
transform: translateY(-2px);
```

Very subtle.

---

## Never Use

* Heavy shadows
* Glassmorphism
* Neumorphism
* Gradient cards

---

# Input Fields

Height

```css
48px
```

Radius

```css
12px
```

Border

```css
1px solid #CBD5E1
```

Focus

```css
2px ring #2563EB
```

---

# Navbar

Height

```css
72px
```

Sticky

Yes

Background

```css
rgba(255,255,255,0.9)
```

Blur

```css
backdrop-blur-md
```

---

# Dashboard Design

Dashboard should follow Linear.

## Analytics Cards

Simple.

Show:

* Total QR Codes
* Total Scans
* Active QR Codes
* Conversion Rate

Do not use:

* Fancy gauges
* 3D charts
* Huge colorful graphs

---

# Landing Page Structure

## Hero

Left:

* Headline
* Description
* CTA

Right:

* Live QR generator preview

---

## Trust Section

Show:

* Dynamic QR Codes
* Analytics
* Custom Branding
* Bulk Generation
* Team Management

---

## Features Section

Use clean cards.

3 columns desktop.

1 column mobile.

---

## Analytics Showcase

Display dashboard screenshots.

Real product.

Not illustrations.

---

## Pricing

Simple Stripe-style pricing.

No dark backgrounds.

No flashy effects.

---

# Icon Style

Use Lucide Icons.

Examples:

* QrCode
* BarChart3
* ScanLine
* Link
* Download
* Users

Never mix icon libraries.

---

# Animations

Follow Linear.

Fast.

Minimal.

Purposeful.

## Duration

```css
150ms - 250ms
```

---

## Avoid

* Bouncy effects
* Large motion
* Floating objects
* Attention-seeking animations

---

# Shadows

Primary Shadow

```css
0 1px 2px rgba(0,0,0,0.04)
```

Secondary Shadow

```css
0 4px 12px rgba(0,0,0,0.06)
```

Never stronger than this.

---

# Trust Signals

Throughout the website emphasize:

* Secure
* Reliable
* Fast
* Business Ready

Show:

* Analytics screenshots
* QR examples
* Real product UI

Avoid stock images.

---

# Final Design Rule

Whenever there is a design decision:

Choose the option that looks more trustworthy and professional.

Never choose the option that looks more trendy.

Trust outperforms trend for a QR platform.
