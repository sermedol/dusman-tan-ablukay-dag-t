# Design System - Platform UI/UX Foundation

**Version:** 1.0  
**Status:** 🟢 Active  
**Reference:** Linear, Stripe, Apple, Arc Browser, Figma  

---

## 🎨 Design Philosophy

This platform's UI reflects premium products like Linear, Stripe, and Apple:

- **Large spacing** - Generous padding/margins reduce cognitive load
- **Editorial typography** - Hierarchy and readability prioritized
- **Smooth animations** - Transitions enhance usability
- **Layered cards** - Visual depth through subtle shadows
- **High quality icons** - Consistent iconography system
- **Zero visual clutter** - Every element serves a purpose
- **Handcrafted feel** - Attention to detail at every level

---

## 📐 Design Tokens

### Color Palette

#### Primary Surface
- **Background**: `#f9f8f6` (Warm cream - reduces eye strain)
- **Surface**: `#ffffff` (White - elevated content)
- **Surface Secondary**: `#f3f4f6` (Light gray - secondary backgrounds)

#### Text Colors
- **Primary**: `#1a1a1a` (Near-black - maximum contrast)
- **Secondary**: `#666666` (Medium gray - supporting text)
- **Tertiary**: `#999999` (Light gray - helper text)
- **Disabled**: `#d1d5db` (Very light gray)

#### Action Color
- **Primary Action**: `#dc2626` (Red - high visibility)
- **Hover**: `#b91c1c` (Darker red)
- **Active**: `#991b1b` (Even darker)

#### Semantic Colors
- **Success**: `#10b981` (Emerald)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Rose)
- **Info**: `#3b82f6` (Blue)

#### Borders & Dividers
- **Border Default**: `#e5e5e5` (Light gray)
- **Border Secondary**: `#f3f4f6` (Very light)
- **Divider**: `#e5e5e5` (Same as border)

### Typography Scale

```
Display Large    48px / 700 weight / 1.2 line-height  (Hero titles)
Display          36px / 700 weight / 1.2 line-height  (Page titles)
Heading 1        32px / 700 weight / 1.25 line-height (Section titles)
Heading 2        24px / 600 weight / 1.3 line-height  (Subsection titles)
Heading 3        18px / 600 weight / 1.4 line-height  (Card titles)
Heading 4        16px / 600 weight / 1.5 line-height  (Strong emphasis)
Body Large       16px / 400 weight / 1.6 line-height  (Main content)
Body             15px / 400 weight / 1.6 line-height  (Default text)
Body Small       14px / 400 weight / 1.5 line-height  (Supporting text)
Caption          12px / 500 weight / 1.4 line-height  (Metadata)
Tiny             11px / 500 weight / 1.4 line-height  (Timestamps)
```

### Spacing System (4px base unit)

```
xs    4px    (Tight spacing between elements)
sm    8px    (Small gaps)
md    12px   (Standard padding)
lg    16px   (Default padding/margin)
xl    20px   (Generous spacing)
2xl   24px   (Card padding)
3xl   32px   (Section spacing)
4xl   40px   (Large section spacing)
5xl   48px   (Hero spacing)
6xl   64px   (Maximum spacing)
```

### Shadows (Elevation System)

```
xs     0 1px 2px rgba(0,0,0,0.05)
sm     0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
base   0 4px 6px -1px rgba(0,0,0,0.1)
md     0 10px 15px -3px rgba(0,0,0,0.1)
lg     0 20px 25px -5px rgba(0,0,0,0.1)
xl     0 25px 50px -12px rgba(0,0,0,0.25)
```

### Border Radius

```
xs     2px    (Subtle curves)
sm     4px    (Input fields, small buttons)
base   6px    (Default for most elements)
md     8px    (Cards, larger buttons)
lg     12px   (Large cards, sections)
xl     16px   (Hero sections)
full   9999px (Fully rounded - pills, avatars)
```

---

## 🧩 Component Guidelines

### Buttons

#### Primary Button
```tsx
<button className="px-lg py-md bg-red-600 text-white rounded-base hover:bg-red-700 
                   active:bg-red-800 transition-colors duration-base font-semibold text-body-sm">
  Action Label
</button>
```

**Properties:**
- Background: `#dc2626` (red-600)
- Padding: `16px` (lg) horizontal, `12px` (md) vertical
- Border radius: `6px` (base)
- Font weight: `600` (semibold)
- Font size: `14px` (body-sm)
- Hover: `#b91c1c` (red-700)
- Active: `#991b1b` (red-800)

#### Secondary Button
```tsx
<button className="px-lg py-md bg-white text-slate-900 border border-slate-200 
                   rounded-base hover:bg-slate-50 transition-colors duration-base font-medium text-body-sm">
  Secondary Action
</button>
```

**Properties:**
- Background: `#ffffff` (white)
- Border: `1px solid #e5e5e5` (slate-200)
- Text color: `#1a1a1a` (slate-900)
- Hover: `#f3f4f6` (slate-100)

### Cards

```tsx
<div className="bg-white border border-slate-200 rounded-md shadow-sm 
               hover:shadow-md transition-shadow duration-base p-2xl">
  <h3 className="text-h3 font-semibold mb-md">Card Title</h3>
  <p className="text-body text-slate-600">Card content goes here.</p>
</div>
```

**Properties:**
- Background: `#ffffff` (white)
- Border: `1px solid #e5e5e5` (slate-200)
- Border radius: `8px` (md)
- Padding: `24px` (2xl)
- Shadow: `sm` (0 1px 3px rgba...)
- Hover shadow: `md` (elevation effect)

### Input Fields

```tsx
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-lg py-md bg-white border border-slate-200 
            rounded-base placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent
            text-body"
/>
```

**Properties:**
- Background: `#ffffff` (white)
- Border: `1px solid #e5e5e5` (slate-200)
- Padding: `16px` (lg) horizontal, `12px` (md) vertical
- Border radius: `6px` (base)
- Focus ring: `2px solid #dc2626` (red-600)
- Font size: `15px` (body)

### Modals

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-lg z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-2xl">
    <h2 className="text-h2 font-semibold mb-lg">Modal Title</h2>
    <p className="text-body text-slate-600 mb-xl">Modal content...</p>
    <div className="flex gap-md justify-end">
      <button className="px-lg py-md text-slate-600 hover:bg-slate-100 rounded-base">
        Cancel
      </button>
      <button className="px-lg py-md bg-red-600 text-white rounded-base hover:bg-red-700">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Navigation

```tsx
<nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
  <div className="max-w-screen-2xl mx-auto px-lg py-lg flex items-center justify-between">
    <h1 className="text-h4 font-semibold">Platform Name</h1>
    <div className="flex gap-2xl">
      <a href="/" className="text-body hover:text-red-600 transition-colors">Home</a>
      <a href="/explore" className="text-body hover:text-red-600 transition-colors">Explore</a>
    </div>
  </div>
</nav>
```

---

## 🎯 UX Patterns

### Progressive Disclosure
- Start with simple interface
- Complexity emerges through user interaction
- Each layer answers one question
- Path: Search → Browse → Explore → Investigate

### Feedback & Validation
- Inline error messages (red text near inputs)
- Success confirmations (green toast)
- Loading states (spinner + message)
- Disabled states (reduced opacity + no cursor)

### Accessibility
- All buttons have visible focus states (ring-2 ring-red-600)
- Text contrast >= 4.5:1 for normal text
- Interactive elements are at least 44x44px
- Keyboard navigation fully supported
- Screen reader announcements for important changes

---

## 📐 Layout Guidelines

### Max Width Containers
- Full width: For hero sections, full-bleed backgrounds
- Content width: `1200px` (max-w-screen-xl)
- Narrow width: `900px` (max-w-2xl) for forms, detailed content

### Responsive Breakpoints
- Mobile: `0px`
- Tablet: `768px` (md)
- Desktop: `1024px` (lg)
- Wide: `1280px` (xl)
- Extra wide: `1536px` (2xl)

### Padding & Margins
- Mobile: `20px` (md)
- Tablet+: `24px` (2xl) to `32px` (3xl)
- Between sections: `48px` (5xl) to `64px` (6xl)

---

## 🎬 Animation Guidelines

### Transitions
- **Fast**: `100ms` (feedback, micro-interactions)
- **Base**: `200ms` (standard transitions)
- **Slow**: `300ms` (complex animations)

### Easing
- `ease-in-out`: Default (most natural)
- `ease-out`: For entering elements
- `ease-in`: For leaving elements
- `linear`: For continuous animations

### Common Animations
- Fade in: opacity 0→1 in 200ms
- Slide up: transform translateY(8px)→0 in 300ms
- Hover lift: shadow sm→md in 200ms

---

## 🌓 Dark Mode (Future)

The design system is built to support dark mode in the future:

- Use CSS custom properties for colors
- Test contrast ratios for dark backgrounds
- Preserve readability in low-light conditions

---

## 📱 Implementation Checklist

When building components:

- [ ] Follows typography scale
- [ ] Uses design token colors (not hardcoded hex)
- [ ] Proper spacing (multiples of 4px)
- [ ] Appropriate shadow elevation
- [ ] Smooth transitions (100ms-300ms)
- [ ] Keyboard accessible
- [ ] Mobile responsive
- [ ] Focus states visible
- [ ] Error/success states clear
- [ ] Loading states shown
- [ ] Disabled states visible

---

## 🔧 Usage in Code

```tsx
// ✓ Good - Using design tokens
<div className="p-2xl bg-white border border-slate-200 rounded-md shadow-sm">
  <h2 className="text-h2 text-slate-900 mb-lg">Title</h2>
  <p className="text-body text-slate-600">Content</p>
</div>

// ✗ Bad - Hardcoded values
<div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
  <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Title</h2>
  <p style={{ fontSize: '15px', color: '#999' }}>Content</p>
</div>
```

---

**Design System Owner:** Technical Lead  
**Last Updated:** 6 Ağustos 2026  
**Status:** 🟢 Production Ready
