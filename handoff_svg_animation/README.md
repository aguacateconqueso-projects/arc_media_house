# Hero Bloom — Drop-in animation

Self-contained background animation for the hero section. **Does not modify your hero markup, copy, or layout.**

## What you get

- A soft, organic, breathing "bloom" — 7 asymmetric blurred lobes rotating slowly on a ring + a pulsing center mass.
- Auto-themes via `currentColor` (reads `--fg` or whatever color you set on the hero).
- ~8 SVG attribute updates per frame. GPU-accelerated blur. Pauses when tab hidden. Respects `prefers-reduced-motion`.
- Idempotent: safe to hot-reload, won't double-mount.

## Files

- `hero-bloom.js` — the animation. Self-mounting; does NOT touch your hero's existing children other than ensuring they stack above the SVG.
- `hero-bloom.css` — positioning + theme keyframes.

## Install (3 steps, no markup changes)

1. Drop both files into your assets directory.
2. Add to your HTML `<head>`:
   ```html
   <link rel="stylesheet" href="/path/to/hero-bloom.css">
   ```
3. Add at the end of `<body>` (after the hero is in the DOM):
   ```html
   <script src="/path/to/hero-bloom.js" defer></script>
   ```

That's it. The script auto-finds `.hero` and mounts the SVG behind your existing content.

## Custom hero selector

If your hero element is not `.hero`:

```html
<script src="/path/to/hero-bloom.js" data-target="#my-hero" defer></script>
```

## How it interacts with your hero (non-destructive)

The script:
1. Finds the target element.
2. Ensures it has `position: relative` (only sets if currently `static`).
3. Ensures it has `overflow: hidden` (only sets if currently `visible`).
4. Prepends the SVG.
5. For each existing direct child: ensures it has `position` and a `z-index` so it stacks above the SVG (only sets if missing — won't break flex/grid).

It does **not** touch text, classes, animations, or layout of the hero contents.

## Tuning

In `hero-bloom.js`:
- `stdDeviation="4.5"` — blur amount. Increase for softer, decrease for sharper.
- `const N = 7;` — number of lobes.
- `t * 4` in `rot` — rotation speed (deg/sec). 4 = full turn / 90s.
- The two `Math.sin` terms in `dist` and `r` — breathing speed and amplitude.

In `hero-bloom.css`:
- `width: 70%; right: -10%;` — bloom size and bleed.
- `opacity: 0.78` (and `.55` for light theme) — overall strength.

## Theming

The SVG fills with `currentColor`. Set the `color` CSS property on `.hero__bloom` (or a parent like `.hero`) to control the bloom color. The provided CSS reads `var(--fg, #f4f4f1)`.
