<script lang="ts">
  import { staffPosition, ledgerLines, type Note, type Clef } from "../lib/music";

  let { note, clef }: { note: Note; clef: Clef } = $props();

  // SVG coordinate system — scaled up ~1.7x from original
  const WIDTH = 540;
  const HEIGHT = 360;
  const STAFF_LEFT = 110;
  const STAFF_RIGHT = WIDTH - 50;
  const STAFF_WIDTH = STAFF_RIGHT - STAFF_LEFT;
  const NOTE_X = STAFF_LEFT + STAFF_WIDTH * 0.55;
  const LINE_SPACING = 24;
  const BOTTOM_LINE_Y = HEIGHT / 2 + 2 * LINE_SPACING;

  function posToY(position: number): number {
    return BOTTOM_LINE_Y - position * (LINE_SPACING / 2);
  }

  const staffLineYs = [0, 2, 4, 6, 8].map(posToY);

  let pos = $derived(staffPosition(note.letter, note.octave, clef));
  let noteY = $derived(posToY(pos));
  let ledgers = $derived(ledgerLines(pos));
  let needsLedgerAtNote = $derived(
    pos % 2 === 0 && (pos < 0 || pos > 8) && !ledgers.includes(pos)
  );
  let allLedgers = $derived(needsLedgerAtNote ? [...ledgers, pos] : ledgers);

  const LEDGER_HALF = 30;
</script>

<svg
  viewBox="0 0 {WIDTH} {HEIGHT}"
  xmlns="http://www.w3.org/2000/svg"
  class="staff"
  role="img"
  aria-label="Musical staff showing a note"
>
  <!-- Staff lines -->
  {#each staffLineYs as y}
    <line
      x1={STAFF_LEFT}
      y1={y}
      x2={STAFF_RIGHT}
      y2={y}
      stroke="var(--staff-line)"
      stroke-width="2"
    />
  {/each}

  <!-- Clef symbol -->
  {#if clef === "treble"}
    <text
      x={STAFF_LEFT + 7}
      y={posToY(3) - 2}
      font-size="145"
      fill="var(--clef-color)"
      font-family="serif"
      dominant-baseline="middle"
      text-anchor="start"
    >&#119070;</text>
  {:else}
    <text
      x={STAFF_LEFT + 10}
      y={posToY(4) - 2}
      font-size="112"
      fill="var(--clef-color)"
      font-family="serif"
      dominant-baseline="middle"
      text-anchor="start"
    >&#119074;</text>
  {/if}

  <!-- Ledger lines -->
  {#each allLedgers as lPos}
    <line
      x1={NOTE_X - LEDGER_HALF}
      y1={posToY(lPos)}
      x2={NOTE_X + LEDGER_HALF}
      y2={posToY(lPos)}
      stroke="var(--staff-line)"
      stroke-width="2"
    />
  {/each}

  <!-- Accidental -->
  {#if note.accidental === "sharp"}
    <text
      x={NOTE_X - 22}
      y={noteY + 5.5}
      font-size="52"
      fill="var(--note-color)"
      dominant-baseline="middle"
      text-anchor="end"
      font-family="serif"
    >&#9839;</text>
  {:else if note.accidental === "flat"}
    <text
      x={NOTE_X - 20}
      y={noteY - 5}
      font-size="52"
      fill="var(--note-color)"
      dominant-baseline="middle"
      text-anchor="end"
      font-family="serif"
    >&#9837;</text>
  {/if}

  <!-- Note head (filled ellipse) -->
  <ellipse
    cx={NOTE_X}
    cy={noteY}
    rx="14"
    ry="10"
    fill="var(--note-color)"
    transform="rotate(-10, {NOTE_X}, {noteY})"
  />
</svg>

<style>
  .staff {
    width: 100%;
    max-width: 740px;
    height: auto;
    display: block;
    margin: 0 auto;
  }
</style>
