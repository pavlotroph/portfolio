## Pavlo Portfolio

Modern, multi-section portfolio for showcasing projects, photography, and brand identity. Built with React + Vite, styled-components, and SSR-friendly optimizations for fast deployments to Netlify or Vercel.

### Live & Reports

- Production: `dist/` output deployable to Netlify (`netlify.toml`) or Vercel (`vercel.json`)
- Lighthouse snapshot: `pavlotroph.com_2025-11-09_23-24-43.report.html`

---

## Procedure (Setup & Development)

1. **Prerequisites**
   - Node.js 20+ (recommended) and npm 10+
   - Optional: Netlify/Vercel CLI for previewing hosted builds
2. **Install**
   ```bash
   npm install
   ```
3. **Environment (optional but recommended)**
   - Replace hardcoded Supabase credentials in `src/supabaseClient.ts` with environment variables, e.g. create `.env`:
     ```bash
     VITE_SUPABASE_URL=...
     VITE_SUPABASE_ANON_KEY=...
     ```
   - Update `src/supabaseClient.ts` to read from `import.meta.env`.
4. **Run locally**
   ```bash
   npm run dev
   ```
5. **Production build**
   ```bash
   npm run build
   npm run preview   # optional sanity check of dist/
   ```
6. **Static prerendering**
   - `npm run build` triggers `react-snap` (via `postbuild`) to prerender the key routes listed in `package.json`.
7. **Deploy**
   - Copy the `dist/` folder to your hosting provider, or point Netlify/Vercel to `npm run build`.

---

## Folder Structure

```
pavlo-portfolio/
├─ src/
│  ├─ assets/
│  │  ├─ fonts/
│  │  │  ├─ Geist/, Geist_mono/, JetBrains/    # Typography stack
│  │  ├─ icons/                                # SVG icon set
│  │  └─ video/                                # Animated logos / hero loops
│  ├─ components/
│  │  ├─ AboutUsComponents/                    # About section layout + copy
│  │  ├─ CollectionComponent/                  # Collection section grid + styles
│  │  ├─ CollectionsSwiper/                    # Swiper-powered carousel
│  │  ├─ ContactForm/                          # Contact form UI + validation
│  │  ├─ Container/, Layout/, InPageNav/, ...  # Structural wrappers
│  │  ├─ Loader/, Preloader/, Modal/, MobileMenu/
│  │  ├─ SlidePartners/, Quote/, Feedback/     # Storytelling widgets
│  │  └─ Header/, Footer/, GoogleSearch/       # Site chrome
│  ├─ hooks/
│  │  └─ useProject.ts                         # Supabase data hook (projects)
│  ├─ lib/
│  │  ├─ *.csv / *.sql                         # Seed data exported from Supabase
│  │  └─ supabaseHelpers.ts                    # Shared query utilities
│  ├─ pages/
│  │  ├─ HomePage/, Work/, Photo/, Info/       # Route-level experiences
│  │  ├─ AboutUs/, Contact/, CollectionPage/   # Supplemental landing pages
│  │  └─ Reveal/                               # Scroll reveal experiments
│  ├─ styles/
│  │  └─ aos-fix.css                           # Override for AOS inside Vite
│  ├─ GlobalStyle.ts / theme.ts                # Base resets + design tokens
│  ├─ App.tsx / App.styled.ts                  # Root layout and transitions
│  ├─ main.tsx                                 # Vite/React bootstrap
│  ├─ supabaseClient.ts                        # Supabase client init
│  └─ utils/
│     └─ cacheUtils.ts                         # Session/local cache helpers
├─ public/                                     # Static assets copied verbatim
├─ dist/                                       # Production build artifacts
├─ dist-server/                                # Server bundle (ssg/prerender)
├─ build-log.txt                               # Latest build transcript
├─ netlify.toml / vercel.json                  # Hosting configuration
├─ PRERENDERING.md / SVG_ERROR_FIX.md          # Ops playbooks
├─ vite.config.ts (+ timestamped backup)       # Vite + plugin config
├─ webpack.config.ts                           # Legacy bundler reference
├─ package.json / package-lock.json            # Dependencies + scripts
└─ README.md                                   # This file
```

---

## What Changed (Highlights)

- **Custom visual identity**

  - Bespoke typography (`Geist`, `JetBrainsMono`) and motion assets in `src/assets`.
  - Animated preloader, in-page navigation, and swiper galleries created under `src/components`.

- **Content structure overhaul**

  - Dedicated route pages (`src/pages/*`) for About, Work collections, Photography, Info, and Contact with shared layout wrappers.
  - CSV/SQL files in `src/lib` to sync Supabase tables with the live portfolio content.

- **Data layer & caching**

  - Supabase integration (`src/supabaseClient.ts`, `src/lib/supabaseHelpers.ts`) plus lightweight caching utilities in `src/utils/cacheUtils.ts`.

- **Deployment improvements**
  - Added prerendering flow (`dist-server/`, `PRERENDERING.md`, `vite-plugin-fix-transition-delay.ts`) for better SEO and instant page loads.
  - Netlify+Vercel configs and `_redirects` for SPA routing.

These changes turn the original scaffold into a fully branded, data-backed portfolio experience optimized for static hosting while maintaining dynamic interactions.

---

## Tech Stack

- React 18 + Vite 6
- TypeScript, styled-components, Emotion
- Supabase (data + contact form persistence)
- AOS, Framer Motion, React Router, react-loader-spinner
- Tooling: ESLint, TypeScript, react-snap prerender, vite-plugin-ssg

---

## Helpful Commands

- `npm run dev` – local development server with Vite HMR
- `npm run build` – type-check + Vite production build + react-snap prerender
- `npm run preview` – serve the built `dist/` locally
- `npm run lint` – ESLint with TypeScript support

---

### Support

Issues or deployment questions? Document steps in `build-log.txt` and reference `PRERENDERING.md` or `SVG_ERROR_FIX.md` for known edge cases. Open a ticket with the relevant details (command, environment, error logs) for faster triage.
