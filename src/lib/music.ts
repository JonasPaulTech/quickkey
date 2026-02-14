/**
 * Music theory data and helpers for the score reading trainer.
 *
 * Staff position convention:
 *   Position 0 = the bottom line of the staff.
 *   Each increment of 1 = one staff step (half the distance between lines).
 *   Lines are at positions 0, 2, 4, 6, 8.
 *   Spaces are at positions 1, 3, 5, 7.
 *   Ledger lines extend below (negative) and above (>8).
 */

export type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type Accidental = "sharp" | "flat" | null;
export type Clef = "treble" | "bass";

export interface Note {
  /** Base letter name */
  letter: NoteLetter;
  /** Octave number (scientific pitch) */
  octave: number;
  /** Accidental applied to this note */
  accidental: Accidental;
  /** MIDI-like numeric value for comparison (C4 = 60) */
  midi: number;
}

// Semitone offsets from C within an octave
const LETTER_SEMITONES: Record<NoteLetter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

/** Compute a MIDI-style number for any note (C4 = 60). */
export function midiNumber(letter: NoteLetter, octave: number, accidental: Accidental): number {
  let base = (octave + 1) * 12 + LETTER_SEMITONES[letter];
  if (accidental === "sharp") base += 1;
  if (accidental === "flat") base -= 1;
  return base;
}

/**
 * Staff position for a note in a given clef.
 *
 * Treble clef: bottom line (pos 0) = E4
 * Bass clef:   bottom line (pos 0) = G2
 *
 * Position only depends on the letter + octave, not the accidental
 * (accidentals are drawn as symbols, they don't shift vertical position).
 */
export function staffPosition(letter: NoteLetter, octave: number, clef: Clef): number {
  // Steps above C within an octave (diatonic)
  const LETTER_STEPS: Record<NoteLetter, number> = {
    C: 0,
    D: 1,
    E: 2,
    F: 3,
    G: 4,
    A: 5,
    B: 6,
  };

  const noteStep = octave * 7 + LETTER_STEPS[letter];

  if (clef === "treble") {
    // E4 is position 0. E4 step = 4*7 + 2 = 30
    const referenceStep = 4 * 7 + 2; // E4
    return noteStep - referenceStep;
  } else {
    // Bass clef: G2 is position 0. G2 step = 2*7 + 4 = 18
    const referenceStep = 2 * 7 + 4; // G2
    return noteStep - referenceStep;
  }
}

/**
 * Build all chromatic notes in the range C2–C6.
 * For each black key, we create both a sharp and flat variant.
 */
function buildNotePool(): Note[] {
  const notes: Note[] = [];
  const letters: NoteLetter[] = ["C", "D", "E", "F", "G", "A", "B"];

  for (let octave = 2; octave <= 6; octave++) {
    for (const letter of letters) {
      // Stop at C6 (inclusive)
      if (octave === 6 && letter !== "C") break;

      // Natural note
      notes.push({
        letter,
        octave,
        accidental: null,
        midi: midiNumber(letter, octave, null),
      });

      // Sharp variant (skip E# and B# — they're enharmonic to F/C natural)
      if (letter !== "E" && letter !== "B") {
        notes.push({
          letter,
          octave,
          accidental: "sharp",
          midi: midiNumber(letter, octave, "sharp"),
        });
      }

      // Flat variant (skip Cb and Fb — they're enharmonic to B/E natural)
      // We add flats on D, E, G, A, B
      if (letter === "D" || letter === "E" || letter === "G" || letter === "A" || letter === "B") {
        notes.push({
          letter,
          octave,
          accidental: "flat",
          midi: midiNumber(letter, octave, "flat"),
        });
      }
    }
  }

  return notes;
}

const NOTE_POOL = buildNotePool();

/**
 * Pick a random note and clef.
 * For treble clef, notes in A3–C6  (Ab3 at midi 56 through C6 at midi 84).
 * For bass clef, notes in C2–F#4  (C2 at midi 36 through F#4 at midi 66).
 * This keeps notes reasonably close to the staff without excessive ledger lines.
 */
export function randomNote(): { note: Note; clef: Clef } {
  const clef: Clef = Math.random() < 0.5 ? "treble" : "bass";

  let pool: Note[];
  if (clef === "treble") {
    // Ab3 (midi 56) to C6 (midi 84)
    pool = NOTE_POOL.filter((n) => n.midi >= 56 && n.midi <= 84);
  } else {
    // C2 (midi 36) to F#4 (midi 66)
    pool = NOTE_POOL.filter((n) => n.midi >= 36 && n.midi <= 66);
  }

  const note = pool[Math.floor(Math.random() * pool.length)];
  return { note, clef };
}

/**
 * Check if the pressed MIDI value matches the target note.
 * This handles enharmonic equivalence automatically since we compare MIDI numbers.
 */
export function isCorrect(target: Note, pressedMidi: number): boolean {
  return target.midi === pressedMidi;
}

/**
 * Get the display string for a note (e.g. "C#4", "Db3", "F5").
 */
export function noteDisplay(note: Note): string {
  const acc = note.accidental === "sharp" ? "#" : note.accidental === "flat" ? "b" : "";
  return `${note.letter}${acc}${note.octave}`;
}

/**
 * Return which ledger lines are needed for a note at a given staff position.
 * Returns an array of positions where ledger lines should be drawn.
 */
export function ledgerLines(position: number): number[] {
  const lines: number[] = [];

  // Below the staff (position < 0): ledger lines at 0, -2, -4, ...
  if (position <= -2) {
    for (let p = -2; p >= position; p -= 2) {
      lines.push(p);
    }
  }

  // Above the staff (position > 8): ledger lines at 10, 12, 14, ...
  if (position >= 10) {
    for (let p = 10; p <= position; p += 2) {
      lines.push(p);
    }
  }

  return lines;
}

/**
 * All the white and black keys for the keyboard component (C2–C6).
 */
export interface KeyInfo {
  midi: number;
  letter: NoteLetter;
  octave: number;
  isBlack: boolean;
  /** Label shown on the key (e.g. "C4") — only for naturals */
  label: string;
}

export function buildKeyboard(): KeyInfo[] {
  const keys: KeyInfo[] = [];
  const letters: NoteLetter[] = ["C", "D", "E", "F", "G", "A", "B"];
  const blackAfter = new Set<NoteLetter>(["C", "D", "F", "G", "A"]);

  for (let octave = 2; octave <= 6; octave++) {
    for (const letter of letters) {
      if (octave === 6 && letter !== "C") break;

      // White key
      keys.push({
        midi: midiNumber(letter, octave, null),
        letter,
        octave,
        isBlack: false,
        label: `${letter}${octave}`,
      });

      // Black key after this white key
      if (blackAfter.has(letter) && !(octave === 6)) {
        keys.push({
          midi: midiNumber(letter, octave, "sharp"),
          letter,
          octave,
          isBlack: true,
          label: "",
        });
      }
    }
  }

  return keys;
}
