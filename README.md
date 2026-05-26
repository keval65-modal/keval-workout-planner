# My Fitness Coach

Mobile-first, offline PWA workout tracker — your personal trainer with guided step-by-step workouts.

## Features

- **Today's Workout** on the home screen with warm-up, strength, cardio, stretching
- **Guided Workout Mode** — one exercise at a time, rest timers, auto-advance
- **Progressive overload** — last session history and weight suggestions
- **Fixed weekly schedule** (Mon–Sun)
- **Posture module** — Fix My Hunchback with weekly tracking
- **Measurements & progress photos** with trend charts
- **Timers** — workout, rest, stretch, cardio, intervals
- **Local notifications** — gym prep, workout, posture (optional hydration)
- **Backup** — export/import JSON (no cloud, no login)

## Tech

- Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- Dexie (IndexedDB)
- PWA via `@ducanh2912/next-pwa`
- Recharts

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Install to home screen on Android for the best experience.

## Build

```bash
npm run build
npm start
```

## Data

All data is stored in the browser IndexedDB on this device only. Use **Settings → Export backup** before switching devices.
