# Orbexs Layout Patterns — Complete Reference

## Page Architecture

### Root Layout

```tsx
<html className={`${geist.variable} ${geistMono.variable} antialiased`}>
  <body className="bg-white text-[#0a0a0a] min-h-screen flex flex-col">
    <Header />
    <main className="flex-1 flex flex-col relative">
      {children}
    </main>
    <Footer />
  </body>
</html>
```

Key points:
- `flex flex-col` on body + `flex-1` on main = footer always at bottom
- Font variables applied on `<html>`, not `<body>`
- `antialiased` at the root level
- Background is white, text is near-black (#0a0a0a)

---

## Section Templates

### Light Section (default)

```tsx
<section className="py-32">
  <div className="mx-auto max-w-7xl px-6">
    {/* Eyebrow */}
    <div className="flex items-center gap-3 mb-6">
      <span className="inline-block w-3 h-px bg-[#0a0a0a]/30" />
      <span className="text-[10px] font-bold uppercase tracking-[0.35em]">
        SECTION LABEL
      </span>
    </div>

    {/* Headline */}
    <h2 className="text-[length:var(--text-fluid-h1)] font-bold tracking-tight">
      Section Title
    </h2>

    {/* Description */}
    <p className="mt-6 max-w-2xl text-[length:var(--text-fluid-p)] text-[#525252] leading-relaxed">
      Section description text.
    </p>

    {/* Content grid */}
    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cards */}
    </div>
  </div>
</section>
```

### Dark Section

```tsx
<section className="py-32 bg-[#0a0a0a] text-white">
  <div className="mx-auto max-w-7xl px-6">
    {/* Eyebrow: text-[#a3a3a3], line: bg-white/30 */}
    {/* Headline: text-white */}
    {/* Description: text-[#a3a3a3] */}
    {/* Cards: dark panel variant */}
  </div>
</section>
```

### Alternate Gray Section

```tsx
<section className="py-32 bg-[#f8f8f8] border-t border-[#e5e5e5]">
  <div className="mx-auto max-w-7xl px-6">
    {/* Same content structure as light section */}
  </div>
</section>
```

---

## Section Background Alternation

The homepage follows this rhythm:

```
1. Hero          → white (#ffffff)
2. TrustBar      → white, with border-t and border-b (#e5e5e5)
3. Services      → white, bg-grid pattern
4. FlagshipAI    → dark (#0a0a0a)
5. Methodology   → white, border-t (#e5e5e5)
6. TechStack     → light gray (#f8f8f8), border-t
7. FAQ           → light gray (#f8f8f8)
8. Metrics       → dark (#0a0a0a), border-t (#1a1a1a)
9. CTA           → dark (#0a0a0a)
```

Pattern: White → Gray → White → Dark. Never two identical backgrounds adjacent.
Section transitions use `border-t` dividers, not gaps or gradients.

---

## Grid Systems

### 3-Column Card Grid (most common)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### 2-Column Split Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
  <div>{/* Left: text content */}</div>
  <div>{/* Right: visual/cards/form */}</div>
</div>
```

### 5-Column Methodology Steps

```tsx
<div className="hidden md:flex items-start gap-0">
  {steps.map(step => (
    <div key={step.id} className="flex-1">
      {/* Step content */}
    </div>
  ))}
</div>
```

### Split Form Layout

```tsx
<div className="flex flex-col md:flex-row min-h-screen">
  <div className="md:w-5/12 bg-[#0a0a0a] text-white p-8 md:p-16 md:sticky md:top-0 md:h-screen">
    {/* Left: info panel */}
  </div>
  <div className="md:w-7/12 p-8 md:p-16">
    {/* Right: form */}
  </div>
</div>
```

---

## Responsive Breakpoints

```
Mobile-first approach:
Default:  0px+    (mobile)
md:       768px+  (tablet)
lg:       1024px+ (desktop)
xl:       1280px+ (wide desktop)
```

### Common Responsive Patterns

```tsx
// Grid columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Hide/show
hidden md:block    // Show on tablet+
md:hidden          // Hide on tablet+

// Text scaling
text-3xl md:text-4xl lg:text-5xl

// Flex direction
flex-col md:flex-row

// Padding
p-6 md:p-8 lg:p-12

// Container width adjustments
max-w-7xl (standard) → max-w-3xl (narrow content)
```

---

## Hero Section Layout

```
Structure:
├── Container: min-h-screen, flex items-center
├── Content: max-w-7xl px-6
│   ├── Eyebrow (animated)
│   ├── Headline: fluid-hero, max-w-5xl
│   ├── Description: max-w-2xl, mt-6
│   └── CTA buttons: flex gap-4, mt-8
└── Background: clean white (no gradient, no pattern)
```

For product/landing pages, the hero is shorter (`py-32` instead of `min-h-screen`).

---

## Product Landing Page Structure

Reusable template for all service pages:

```
1. Hero (light, py-32)
   ├── Eyebrow + Title (ScrambleText) + Subtitle + Description + CTA

2. Features Grid (light, py-32, border-t)
   ├── 2-column grid
   ├── Feature: title + description, no card/border styling

3. Capabilities (dark, py-32)
   ├── 3-column grid
   ├── Group title + bulleted items (dash-separated)

4. CTA (light, py-32, border-t)
   ├── Centered heading + description + button
```

---

## Legal Page Layout

```tsx
<section className="py-32">
  <div className="mx-auto max-w-4xl px-6">
    <div className="mb-12">
      <span className="inline-flex items-center gap-2 bg-[#f8f8f8] px-3 py-1.5 mb-6">
        {/* Badge */}
      </span>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-[#525252] leading-relaxed">{description}</p>
      <p className="mt-2 text-sm text-[#525252]">Last updated: {date}</p>
    </div>
    <div className="space-y-12">
      {/* Sections with h2 (text-2xl md:text-3xl font-semibold) + paragraphs */}
    </div>
  </div>
</section>
```

---

## Navigation Architecture

### Desktop Navigation

```
Fixed header (z-50, h-16)
├── Left: Logo + brand name
├── Center: Nav items
│   ├── Dropdown triggers → mega menu overlay
│   └── Direct links (no children)
└── Right: Lang switcher + CTA button + menu toggle
```

### Mega Menu Overlay

```
Position: fixed, top-16, full-width
Background: #0a0a0a
Layout: max-w-7xl mx-auto, 3-column grid (lg:grid-cols-3)
Columns:
  ├── PLATFORM: Technology products
  ├── SOLUTIONS: Use-case products + direct links
  └── ABOUT: Company info + CONTACT
Bottom bar: copyright + social links, border-t border-white/10
Animation: fade-in with entrance easing
```

### Mobile Menu

Full-screen overlay, stacked navigation with animated hamburger.

---

## Internationalization Layout

```
Route structure: /[locale]/page-slug
Locales: es (default), en
Static params: generateStaticParams() for all locales

Metadata per page:
- generateMetadata() with locale-aware title, description
- Canonical URL with locale prefix
- Language alternates (hreflang)
- OpenGraph with locale
- Twitter card

Structured data: Organization JSON-LD in root layout
```

---

## Dynamic Imports (Code Splitting)

Homepage sections below the fold use `next/dynamic`:

```tsx
const Services = dynamic(() =>
  import("@/components/sections/Services").then(m => m.Services)
)
```

This pattern keeps the initial bundle small. Hero and TrustBar load inline.

---

## SEO Patterns

### Page Metadata Template

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = getDictionary(locale)
  return {
    title: t.page.meta.title,
    description: t.page.meta.description,
    alternates: {
      canonical: `${siteConfig.url}/${locale}/page-slug`,
      languages: { es: `${siteConfig.url}/es/page-slug`, en: `${siteConfig.url}/en/page-slug` }
    },
    openGraph: {
      type: "website",
      locale,
      url: `${siteConfig.url}/${locale}/page-slug`,
      title: t.page.meta.title,
      description: t.page.meta.description,
      images: [{ url: siteConfig.images.social, width: 1200, height: 630 }]
    },
    twitter: { card: "summary_large_image" }
  }
}
```

### JSON-LD (Organization)

Injected in root layout via `<script type="application/ld+json">`.
If modifying FAQ sections, sync the `FAQPage` schema in page.tsx.
