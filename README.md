# Score Teacher

A minimalist web app for practicing reading sheet music faster. A random note appears on a treble or bass clef staff, and you identify it by clicking the corresponding key on a piano keyboard. Built for speed training with immediate visual feedback.

## Features

- **SVG staff rendering** — treble and bass clef with note heads, ledger lines, and sharp/flat accidentals
- **SVG piano keyboard** — clickable C2–C6 range with green/red color flash feedback
- **Practice modes** with a sidebar for difficulty selection:

  | Mode | Difficulty | Clef | Notes | Range |
  |------|-----------|------|-------|-------|
  | Treble | Beginner | Treble only | Naturals only | C4–F5 |
  | Bass | Beginner | Bass only | Naturals only | G2–C4 |
  | Both Clefs | Intermediate | Both | Sharps & flats | ~1 ledger line |
  | Full Range | Expert | Both | All accidentals | Ab3–C6 / C2–F#4 |

- **Stats tracking** — current streak, best streak, rolling average response time (last 10 correct answers)
- **LocalStorage persistence** — stats and selected mode survive page reloads
- **Enharmonic equivalence** — both spellings accepted (e.g. F# and Gb)
- **Localization** — English, German, and Korean. Auto-detects from browser language with a manual EN/DE/KO toggle in the sidebar. Language preference persists in localStorage.

## Tech stack

- [Svelte 5](https://svelte.dev/) (runes API) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- Pure SVG rendering — no external music or notation libraries
- DM Sans + JetBrains Mono fonts, warm dark theme

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run svelte-check and TypeScript type checking |

## Deploying as a systemd service

A unit file is included at `score-teacher.service`. To set it up:

```bash
# Symlink into systemd
sudo ln -s /root/score-teacher/score-teacher.service /etc/systemd/system/score-teacher.service

# Reload, start, and enable on boot
sudo systemctl daemon-reload
sudo systemctl start score-teacher
sudo systemctl enable score-teacher
```

The service builds the project and serves it on port 3300. Check status with `systemctl status score-teacher`.

## Project structure

```
src/
├── main.ts                  # Svelte 5 mount entry point
├── app.css                  # Global styles, CSS variables, dark theme, fonts
├── App.svelte               # Game loop, state management, localStorage, layout
├── lib/
│   ├── music.ts             # Note types, MIDI, staff positions, note pool, modes, keyboard layout
│   └── i18n.ts              # Translations (EN/DE/KO), locale detection and persistence
└── components/
    ├── Staff.svelte          # SVG staff: lines, clef symbols, note head, ledger lines, accidentals
    ├── Keyboard.svelte       # SVG piano: white/black keys, click handler, feedback
    └── Sidebar.svelte        # Practice mode selection sidebar, language toggle
score-teacher.service         # systemd unit file for production deployment
```
