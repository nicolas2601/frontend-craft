# Wiring the kit per framework

`start.mjs` copies the kit into `src/craft/` (or `app/craft/`, `craft/`, or `--kit <dir>`). Paths below assume `src/craft/`. In every case: load `tokens.css`, then `craft.css`; call `init(document)` once after the DOM exists; keep the cleanup.

The recipes and the premium layer (`references/recipes.md`) load after them: `layouts.css`, `recipes.css`, then `premium.css`. In a bundled project smooth scroll needs `npm i lenis` and `init(document, { libs: { lenis: () => import('lenis') } })`, with `data-smooth` on `<html>`; without it the page scrolls natively.

## Plain HTML

```html
<head>
  <script>document.documentElement.classList.add('craft-js')</script>
  <!-- font links printed by start.mjs -->
  <link rel="stylesheet" href="craft/tokens.css">
  <link rel="stylesheet" href="craft/craft.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ...
  <script type="module">
    import { init } from './craft/craft-motion.js';
    init(document);
  </script>
</body>
```

Open it through a server (`npx serve .`, `python -m http.server`): browsers do not run module scripts from `file://`. The check serves the folder itself with `--file index.html`.

## React + Vite

```tsx
// src/main.tsx
import './craft/tokens.css';
import './craft/craft.css';
import './index.css';

// src/App.tsx
import { useEffect } from 'react';
import { init } from './craft/craft-motion.js';

export default function App() {
  useEffect(() => init(document), []);
  return <main>...</main>;
}
```

Add the `craft-js` head script and the font `<link>` tags to `index.html`. Check the build with `--root dist` after `npm run build`, or the dev server with `--url http://localhost:5173`.

## Next.js (App Router)

```tsx
// app/craft-motion.tsx
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { init } from './craft/craft-motion.js';

export function CraftMotion() {
  const pathname = usePathname();
  useEffect(() => init(document), [pathname]);
  return null;
}
```

```tsx
// app/layout.tsx
import './craft/tokens.css';
import './craft/craft.css';
import './globals.css';
import { CraftMotion } from './craft-motion';
// paste the next/font block printed by start.mjs here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('craft-js')" }} />
      </head>
      <body>
        {children}
        <CraftMotion />
      </body>
    </html>
  );
}
```

`tokens.css` reads `--next-display` and `--next-text` from next/font, so the dealt families load self-hosted. Animated text must be static markup; do not put `data-words` on text that comes from state.

## Vue 3

```vue
<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { init } from './craft/craft-motion.js';
let stop = () => {};
onMounted(() => { stop = init(document); });
onBeforeUnmount(() => stop());
</script>
```

Import the two CSS files in `main.ts`. With Vue Router, call `stop(); stop = init(document)` in `router.afterEach` after `nextTick`.

## Svelte / SvelteKit

```svelte
<script>
  import { onMount } from 'svelte';
  import { init } from '$lib/craft/craft-motion.js';
  onMount(() => init(document));
</script>
```

Pass `--kit src/lib/craft` to `start.mjs`. In SvelteKit put it in `+layout.svelte` and import the CSS there.

## Astro

```astro
---
import '../craft/tokens.css';
import '../craft/craft.css';
---
<script>
  import { init } from '../craft/craft-motion.js';
  init(document);
  document.addEventListener('astro:after-swap', () => init(document));
</script>
```

## Tailwind CSS v4

Keep the kit tokens as the source of truth and expose them to utilities:

```css
@import "tailwindcss";
@import "./craft/tokens.css";
@import "./craft/craft.css";

@theme inline {
  --color-bg: var(--c-bg);
  --color-surface: var(--c-surface);
  --color-ink: var(--c-ink);
  --color-muted: var(--c-muted);
  --color-line: var(--c-line);
  --color-accent: var(--c-accent);
  --color-accent-ink: var(--c-accent-ink);
  --font-display: var(--f-display);
  --font-sans: var(--f-text);
  --font-mono: var(--f-mono);
}
```

Then `bg-bg text-ink`, `bg-accent text-accent-ink`, `font-display`. Avoid `transition-all` (the check fails it): use `transition-transform` or `transition-colors`.

## Projects that already use Motion or GSAP

Keep the library the project has. Use the kit's tokens and the effect contract in `motion.md` (durations, easing, reduced motion); do not put a kit attribute and a library animation on the same element.
