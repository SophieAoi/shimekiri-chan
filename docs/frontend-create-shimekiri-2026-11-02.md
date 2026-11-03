# Shimekiri: build plan

Stack: React + TypeScript + Vite, chosen for one responsive codebase, a shareable
live link and no backend.

## Data model

| Field | Type | Required | Constraints | Default |
|---|---|---|---|---|
| title | text | yes | trimmed, 1 to 120 chars | none |
| type | enum | yes | exam / homework / coursework | homework |
| due | date-only | yes | real calendar date, past dates allowed | none, so a wrong deadline is never saved silently |
| list | enum | yes | General or any module | current tab, or General on Upcoming |
| notes | textarea | no | trimmed, max 1000 chars | empty |
| weight | number | no | 0 to 100, decimals allowed | empty |
| completed | boolean | yes | | false |

Modules have a required `name` and an optional `code`. Tabs show the short code,
and the panel heading shows the full name.

## Structure

```
src/
  types.ts, constants.ts     domain types and tunable thresholds
  data/seed.ts               first-run modules
  lib/                       pure logic: dates, tasks, mood, storage, validation
  state/                     reducer and TrackerContext (actions, toast, mood)
  hooks/                     useToday, usePrefs
  components/                Mascot, Tabs, panels, TaskSection, TaskItem, dialogs
  styles/                    design tokens and shared global styles
e2e/                         Playwright journeys, mobile and axe checks
```

## Behaviour decisions

- Urgency: overdue, today and within 3 days are highlighted with text as well as
  colour. Upcoming shows overdue tasks plus the next 14 days.
- Mascot mood is global: happy for 2.5s after completing a task, otherwise nervous
  if anything is overdue or within 3 days, otherwise relaxed.
- Collapsed sections show an urgent count so a closed section cannot hide a deadline.
- Task delete is one click with a 6s Undo toast. Module delete asks for confirmation
  and states how many tasks go with it.
- "Today" refreshes while the app stays open, so overnight tabs do not go stale.
- Changes in another browser tab sync through the `storage` event, so they do not
  overwrite each other.
- Unreadable saved data is copied to a backup key before falling back to the seed.
  A failed save shows a visible warning.
- IDs do not use `crypto.randomUUID`, which is missing on plain-http LAN URLs such
  as testing on a phone through `vite --host`.
- Only the requested modules are seeded. No deadlines are invented for real modules.

## Test plan

- Unit: date maths and labels, urgency boundaries, sorting, grouping, mood priority,
  reducer actions, storage recovery, form validation.
- Component: add, edit, complete, delete with undo, filter, collapse, module
  add/rename/delete, persistence after remount, seed not restored after deleting
  every module.
- E2E: full journey in Chromium, reload persistence, 375px layout without horizontal
  scroll, axe scan with contrast checks.

## Results

- 84 unit and component tests pass. The 10 Playwright tests pass at 1100px and 375px,
  and passed 3 times in a row with no flaky results.
- Bugs found in screenshot review and fixed:
  - The screen-reader text on a tab badge escaped the scrolling tab row and widened
    the page on phones. A regression check is now in the E2E suite.
  - The nervous mascot looked angry rather than worried.
  - Task cards on phones wasted a row on the action buttons.
  - Overdue tasks were labelled "due soon".

## Score

**Overall: SHIP_READY**

| Area | Confidence | Reason |
|---|---|---|
| Accessibility | High | axe passes, including contrast, on both viewports. Keyboard and dialog focus are tested in Chrome. Not checked with a real screen reader. |
| Performance | High | 79 kB of gzipped JS, no network calls, and lists stay small. |
| Test coverage | High | Every requirement has a test. Only tested in Chromium, not Safari or Firefox. |
