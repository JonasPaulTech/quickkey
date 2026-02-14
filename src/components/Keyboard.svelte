<script lang="ts">
  import { buildKeyboard, type KeyInfo } from "../lib/music";

  let {
    feedbackMidi = null,
    feedbackType = null,
    onkeypress,
  }: {
    feedbackMidi: number | null;
    feedbackType: "correct" | "wrong" | null;
    onkeypress: (midi: number) => void;
  } = $props();

  const allKeys = buildKeyboard();
  const whiteKeys = allKeys.filter((k) => !k.isBlack);
  const blackKeys = allKeys.filter((k) => k.isBlack);

  const WHITE_KEY_W = 48;
  const WHITE_KEY_H = 200;
  const BLACK_KEY_W = 30;
  const BLACK_KEY_H = 126;
  const TOTAL_W = whiteKeys.length * WHITE_KEY_W;

  function whiteKeyX(index: number): number {
    return index * WHITE_KEY_W;
  }

  function blackKeyX(key: KeyInfo): number {
    const whiteIndex = whiteKeys.findIndex((w) => w.midi === key.midi - 1);
    return (whiteIndex + 1) * WHITE_KEY_W - BLACK_KEY_W / 2;
  }

  function handleClick(midi: number) {
    onkeypress(midi);
  }

  function isC(key: KeyInfo): boolean {
    return key.letter === "C";
  }
</script>

<div class="keyboard-wrapper">
  <svg
    viewBox="0 0 {TOTAL_W} {WHITE_KEY_H + 4}"
    xmlns="http://www.w3.org/2000/svg"
    class="keyboard"
    role="group"
    aria-label="Piano keyboard"
  >
    <!-- White keys -->
    {#each whiteKeys as key, i}
      {@const x = whiteKeyX(i)}
      {@const isFeedback = feedbackMidi === key.midi && feedbackType}
      <rect
        {x}
        y="0"
        width={WHITE_KEY_W - 2}
        height={WHITE_KEY_H}
        rx="5"
        class="white-key"
        class:correct={isFeedback && feedbackType === "correct"}
        class:wrong={isFeedback && feedbackType === "wrong"}
        onpointerdown={() => handleClick(key.midi)}
        role="button"
        tabindex="0"
        aria-label={key.label}
      />
      {#if isC(key)}
        <text
          x={x + (WHITE_KEY_W - 2) / 2}
          y={WHITE_KEY_H - 14}
          class="key-label"
          text-anchor="middle"
          dominant-baseline="auto"
        >{key.label}</text>
      {/if}
    {/each}

    <!-- Black keys (drawn on top) -->
    {#each blackKeys as key}
      {@const x = blackKeyX(key)}
      {@const isFeedback = feedbackMidi === key.midi && feedbackType}
      <rect
        {x}
        y="0"
        width={BLACK_KEY_W}
        height={BLACK_KEY_H}
        rx="4"
        class="black-key"
        class:correct={isFeedback && feedbackType === "correct"}
        class:wrong={isFeedback && feedbackType === "wrong"}
        onpointerdown={() => handleClick(key.midi)}
        role="button"
        tabindex="0"
        aria-label={`${key.letter}# ${key.octave}`}
      />
    {/each}
  </svg>
</div>

<style>
  .keyboard-wrapper {
    width: 100%;
    margin: 0 auto;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .keyboard {
    width: 100%;
    min-width: 800px;
    height: auto;
    display: block;
  }

  .white-key {
    fill: var(--key-white);
    stroke: var(--key-border);
    stroke-width: 1.5;
    cursor: pointer;
    transition: fill 0.08s ease;
  }

  .white-key:hover {
    fill: var(--key-white-hover);
  }

  .black-key {
    fill: var(--key-black);
    stroke: var(--key-border);
    stroke-width: 1;
    cursor: pointer;
    transition: fill 0.08s ease;
  }

  .black-key:hover {
    fill: var(--key-black-hover);
  }

  .correct {
    fill: var(--feedback-correct) !important;
  }

  .wrong {
    fill: var(--feedback-wrong) !important;
  }

  .key-label {
    font-size: 13px;
    fill: var(--key-label);
    font-family: var(--font-mono);
    pointer-events: none;
    user-select: none;
  }
</style>
