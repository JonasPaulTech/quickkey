<script lang="ts">
  import Staff from "./components/Staff.svelte";
  import Keyboard from "./components/Keyboard.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import { randomNote, isCorrect, type Note, type Clef, type Mode } from "./lib/music";
  import { detectLocale, saveLocale, getTranslations, type Locale } from "./lib/i18n";

  // --- Locale state ---
  let locale = $state<Locale>(detectLocale());
  let t = $derived(getTranslations(locale));

  function handleLocaleChange(l: Locale) {
    locale = l;
    saveLocale(l);
  }

  // --- Mode state ---
  const MODE_KEY = "score-teacher-mode";

  function loadMode(): Mode {
    try {
      const raw = localStorage.getItem(MODE_KEY);
      if (raw && ["treble-basics", "bass-basics", "intermediate", "expert"].includes(raw)) {
        return raw as Mode;
      }
    } catch {}
    return "expert";
  }

  function saveMode(m: Mode) {
    try { localStorage.setItem(MODE_KEY, m); } catch {}
  }

  const initialMode = loadMode();
  let mode = $state<Mode>(initialMode);
  let current = $state(randomNote(initialMode));
  let note: Note = $derived(current.note);
  let clef: Clef = $derived(current.clef);

  // --- Per-mode stats persistence ---
  const STORAGE_KEY = "score-teacher-stats";

  interface ModeStats {
    best: number;
    streak: number;
    recentTimes: number[];
  }

  type AllStats = Record<Mode, ModeStats>;

  function emptyStats(): ModeStats {
    return { best: 0, streak: 0, recentTimes: [] };
  }

  function parseModeStats(raw: unknown): ModeStats {
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      return {
        best: typeof obj.best === "number" ? obj.best : 0,
        streak: typeof obj.streak === "number" ? obj.streak : 0,
        recentTimes: Array.isArray(obj.recentTimes) ? obj.recentTimes : [],
      };
    }
    return emptyStats();
  }

  const ALL_MODES: Mode[] = ["treble-basics", "bass-basics", "intermediate", "expert"];

  function loadAllStats(): AllStats {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        // Migration: old flat format { best, streak, recentTimes }
        if (typeof parsed.best === "number" && !parsed["treble-basics"] && !parsed["expert"]) {
          const migrated: AllStats = {
            "treble-basics": emptyStats(),
            "bass-basics": emptyStats(),
            "intermediate": emptyStats(),
            "expert": emptyStats(),
          };
          // Assign old stats to whatever mode was last selected
          migrated[initialMode] = parseModeStats(parsed);
          return migrated;
        }

        // New per-mode format
        const result: AllStats = {
          "treble-basics": emptyStats(),
          "bass-basics": emptyStats(),
          "intermediate": emptyStats(),
          "expert": emptyStats(),
        };
        for (const m of ALL_MODES) {
          if (parsed[m]) result[m] = parseModeStats(parsed[m]);
        }
        return result;
      }
    } catch {}
    return {
      "treble-basics": emptyStats(),
      "bass-basics": emptyStats(),
      "intermediate": emptyStats(),
      "expert": emptyStats(),
    };
  }

  let allStats: AllStats = loadAllStats();

  function saveAllStats() {
    // Snapshot current mode's live values into allStats before saving
    allStats[mode] = { best, streak, recentTimes };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allStats));
    } catch {}
  }

  // Initialize live state from current mode's saved stats
  const currentSaved = allStats[initialMode];
  let streak = $state(currentSaved.streak);
  let best = $state(currentSaved.best);

  // Rolling average timer (last 10 correct answers)
  const ROLLING_WINDOW = 10;
  let notePresentedAt = $state(performance.now());
  let recentTimes: number[] = $state(currentSaved.recentTimes);
  let avgTime = $derived(
    recentTimes.length > 0
      ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length
      : 0
  );
  let avgDisplay = $derived(
    avgTime > 0 ? (avgTime / 1000).toFixed(1) + "s" : "—"
  );

  let feedbackMidi: number | null = $state(null);
  let feedbackType: "correct" | "wrong" | null = $state(null);
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  function nextNote() {
    current = randomNote(mode);
    notePresentedAt = performance.now();
  }

  function handleModeChange(newMode: Mode) {
    // Save current mode's stats before switching
    saveAllStats();

    mode = newMode;
    saveMode(newMode);

    // Load new mode's stats into live state
    const s = allStats[newMode];
    streak = s.streak;
    best = s.best;
    recentTimes = s.recentTimes;

    // Clear any pending feedback
    if (feedbackTimeout) clearTimeout(feedbackTimeout);
    feedbackMidi = null;
    feedbackType = null;
    nextNote();
  }

  function handleKeypress(midi: number) {
    if (feedbackTimeout) clearTimeout(feedbackTimeout);

    if (isCorrect(note, midi)) {
      const elapsed = performance.now() - notePresentedAt;
      recentTimes = [...recentTimes.slice(-(ROLLING_WINDOW - 1)), elapsed];

      feedbackMidi = midi;
      feedbackType = "correct";
      streak += 1;
      if (streak > best) best = streak;
      saveAllStats();

      feedbackTimeout = setTimeout(() => {
        feedbackMidi = null;
        feedbackType = null;
        nextNote();
      }, 350);
    } else {
      feedbackMidi = midi;
      feedbackType = "wrong";
      streak = 0;
      saveAllStats();

      feedbackTimeout = setTimeout(() => {
        feedbackMidi = null;
        feedbackType = null;
      }, 400);
    }
  }
</script>

<div class="mobile-blocker">
  <div class="mobile-blocker-content">
    <div class="mobile-blocker-icon">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="4" width="24" height="40" rx="3" stroke="currentColor" stroke-width="2.5" opacity="0.35" />
        <rect x="28" y="12" width="44" height="32" rx="3" stroke="currentColor" stroke-width="2.5" />
        <line x1="28" y1="38" x2="72" y2="38" stroke="currentColor" stroke-width="2" opacity="0.5" />
        <circle cx="50" cy="42" r="1.5" fill="currentColor" opacity="0.5" />
        <line x1="14" y1="38" x2="26" y2="38" stroke="currentColor" stroke-width="1.5" opacity="0.25" />
        <circle cx="20" cy="41" r="1" fill="currentColor" opacity="0.25" />
      </svg>
    </div>
    <h2 class="mobile-blocker-title">{t.appTitle}</h2>
    <p class="mobile-blocker-text">{t.mobileBlockerText}</p>
  </div>
</div>

<div class="layout">
  <Sidebar {mode} {locale} {t} onchange={handleModeChange} onlocalechange={handleLocaleChange} />

  <main>
    <header>
      <h1>{t.appTitle}</h1>
      <div class="stats">
        <span class="stat">
          <span class="stat-label">{t.streak}</span>
          <span class="stat-value">{streak}</span>
        </span>
        <span class="stat">
          <span class="stat-label">{t.best}</span>
          <span class="stat-value">{best}</span>
        </span>
        <span class="stat stat-avg">
          <span class="stat-label">{t.avg}</span>
          <span class="stat-value stat-value-avg">{avgDisplay}</span>
        </span>
      </div>
    </header>

    <section class="staff-area">
      <Staff {note} {clef} />
    </section>

    <section class="keyboard-area">
      <Keyboard {feedbackMidi} {feedbackType} onkeypress={handleKeypress} />
    </section>
  </main>
</div>

<style>
  .layout {
    display: flex;
    height: 100vh;
    height: 100dvh;
  }

  main {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 24px 36px;
    gap: 0;
    overflow: hidden;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex: 0 0 auto;
  }

  h1 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 300;
    color: var(--text-primary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin: 0;
    line-height: 1;
  }

  .stats {
    display: flex;
    gap: 28px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-label {
    font-family: var(--font-mono);
    font-size: 0.83rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 2.0rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .staff-area {
    position: relative;
    width: 100%;
    max-width: 740px;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .keyboard-area {
    width: 100%;
    flex: 0 0 auto;
    padding-top: 8px;
  }

  .stat-avg {
    opacity: 0.55;
  }

  .stat-value-avg {
    font-size: 1.43rem;
    font-weight: 500;
  }

  /* Mobile blocker — full-screen overlay on narrow viewports */
  .mobile-blocker {
    display: none;
  }

  @media (max-width: 1045px), (max-height: 705px) {
    .mobile-blocker {
      position: fixed;
      inset: 0;
      z-index: 9000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 32px;
    }

    .layout {
      display: none !important;
    }
  }

  .mobile-blocker-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 320px;
    gap: 20px;
  }

  .mobile-blocker-icon {
    width: 72px;
    height: 72px;
    color: var(--text-muted);
    opacity: 0.6;
  }

  .mobile-blocker-icon svg {
    width: 100%;
    height: 100%;
  }

  .mobile-blocker-title {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 300;
    color: var(--text-primary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin: 0;
  }

  .mobile-blocker-text {
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 400;
    color: var(--text-muted);
    line-height: 1.6;
    margin: 0;
  }
</style>
