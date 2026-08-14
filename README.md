# MMR Running Hub

A mobile-first running calendar. It renders a structured training plan week by
week, lets you tick off runs as you do them, and exports sessions to your
calendar. Built as a PWA, so it installs to a phone home screen.

Live: https://mmr-running-test.vercel.app

## What it does

- **Three views** of the same plan: upcoming runs, the whole plan, and runs
  already gone by
- **Tick off runs** you've completed. Progress is measured against required
  runs only, so skipping the optional shakeouts still gets you to 100%. Ticking
  one instead adds a bonus figure
- **Pace calculator** converting a target min/km into 5k, 10k, 16k and half
  marathon finish times
- **Calendar export** for a single run to Google Calendar, or an `.ics` file for
  the week, the upcoming runs, or the whole plan
- **Strava titles** copied to the clipboard with one tap
- **Multiple plans**, with completed blocks archiving themselves once race day
  passes
- **Plan importer** that reads pasted text from an AI, picking out weeks,
  distances and session types
- Everything saved to `localStorage`. No account, no server, no tracking

## Running it

```bash
npm install
npm run dev        # dev server
npm run build      # production build into dist/
npm run typecheck  # type errors only; the build does not check types
```

Note that `npm run build` deliberately does not run `tsc`, so a type error will
deploy successfully and then fail in the browser. Run `npm run typecheck`
before pushing anything substantial.

## How the code is arranged

```
src/
├── App.tsx              composition only, no logic
├── types.ts             every shared type
├── constants.ts         theme colours, storage keys, category styles, tabs
├── index.css            Tailwind entry point and global styles
├── components/          presentation
├── hooks/               state and side effects
├── lib/                 pure functions, no React
├── data/                the default 8-week half marathon template
└── theme/               accent colour context
```

The rule of thumb: `lib/` holds pure functions that could run anywhere,
`hooks/` holds anything stateful, `components/` holds anything that renders.
`App.tsx` only arranges things.

### Where to change what

| To change | Edit |
| --- | --- |
| A workout card | `components/WorkoutCard.tsx` |
| The header, progress bar, countdown | `components/PlanHeader.tsx` |
| Pace maths | `hooks/usePaceCalculator.ts` |
| Accent colours, tab names, storage keys | `constants.ts` |
| How pasted plans are read | `lib/parsePlan.ts` |
| Calendar and `.ics` output | `lib/calendar.ts` |
| What counts as an optional run | `lib/workouts.ts` |
| The default plan | `data/defaultPlan.ts` |

## Things worth knowing

**Dates are handled locally, never in UTC.** `new Date('2026-07-28')` parses as
UTC midnight while `getDate()` reads local time, which puts every calendar
export a day early for anyone west of the UK. All date parsing goes through
`parseISODate` in `lib/date.ts`, which builds a local-midnight date. Don't
bypass it.

**Optional runs are detected from text**, not a stored field: any workout with
"optional" in its title or advice. This means it works on plans already saved in
a browser with no migration. Write "optional" in a pasted plan and it behaves
the same way.

**All persisted data is validated on read.** `lib/validation.ts` repairs what it
can and discards records with unusable dates, so a corrupt `localStorage` value
can't put a broken shape into React state.

**There is an error boundary.** If something throws, you get a readable message
plus a button to clear saved data, rather than a blank white screen.

## Not built yet

- No way to record what you actually ran, only whether you ran it
- No editing or deleting individual sessions once a plan exists
- Ticks are stored per workout id across the whole app, not scoped per plan
