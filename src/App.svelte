<script lang="ts">
  import Staff from "./components/Staff.svelte";
  import Keyboard from "./components/Keyboard.svelte";
  import { randomNote, isCorrect, type Note, type Clef } from "./lib/music";

  let current = $state(randomNote());
  let note: Note = $derived(current.note);
  let clef: Clef = $derived(current.clef);

  let streak = $state(0);
  let best = $state(0);

  let feedbackMidi: number | null = $state(null);
  let feedbackType: "correct" | "wrong" | null = $state(null);
  let feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  function nextNote() {
    current = randomNote();
  }

  function handleKeypress(midi: number) {
    if (feedbackTimeout) clearTimeout(feedbackTimeout);

    if (isCorrect(note, midi)) {
      feedbackMidi = midi;
      feedbackType = "correct";
      streak += 1;
      if (streak > best) best = streak;

      feedbackTimeout = setTimeout(() => {
        feedbackMidi = null;
        feedbackType = null;
        nextNote();
      }, 350);
    } else {
      feedbackMidi = midi;
      feedbackType = "wrong";
      streak = 0;

      feedbackTimeout = setTimeout(() => {
        feedbackMidi = null;
        feedbackType = null;
      }, 400);
    }
  }
</script>

<main>
  <header>
    <h1>Score Teacher</h1>
    <div class="stats">
      <span class="stat">
        <span class="stat-label">Streak</span>
        <span class="stat-value">{streak}</span>
      </span>
      <span class="stat">
        <span class="stat-label">Best</span>
        <span class="stat-value">{best}</span>
      </span>
    </div>
  </header>

  <section class="staff-area">
    <div class="clef-badge">{clef === "treble" ? "Treble" : "Bass"}</div>
    <Staff {note} {clef} />
  </section>

  <section class="keyboard-area">
    <Keyboard {feedbackMidi} {feedbackType} onkeypress={handleKeypress} />
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    height: 100dvh;
    padding: 28px 24px 36px;
    gap: 0;
    max-width: 1200px;
    margin: 0 auto;
    overflow: hidden;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 740px;
    flex: 0 0 auto;
  }

  h1 {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin: 0;
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
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: 1.8rem;
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

  .clef-badge {
    position: absolute;
    top: 16px;
    right: 8px;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    background: var(--surface-badge);
    padding: 4px 10px;
    border-radius: 3px;
  }

  .keyboard-area {
    width: 100%;
    flex: 0 0 auto;
    padding-top: 8px;
  }
</style>
