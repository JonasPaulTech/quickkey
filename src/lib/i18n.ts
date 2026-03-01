/**
 * Internationalization — English, German, and Korean translations.
 *
 * Locale is auto-detected from the browser language,
 * with a manual override persisted in localStorage.
 */
import type { Mode } from "./music";

export type Locale = "en" | "de" | "ko";

export interface Translations {
    appTitle: string;
    streak: string;
    best: string;
    avg: string;
    trebleClef: string;
    bassClef: string;
    modesHeading: string;
    language: string;
    difficulty: Record<string, string>;
    modeLabel: Record<Mode, string>;
    modeDesc: Record<Mode, string>;
    mobileBlockerText: string;
}

const en: Translations = {
    appTitle: "QuickKey",
    streak: "Streak",
    best: "Best",
    avg: "Avg",
    trebleClef: "Treble",
    bassClef: "Bass",
    modesHeading: "Modes",
    language: "Language",
    difficulty: {
        beginner: "Beginner",
        intermediate: "Intermediate",
        expert: "Expert",
    },
    modeLabel: {
        "treble-basics": "Treble",
        "bass-basics": "Bass",
        intermediate: "Both Clefs",
        expert: "Full Range",
    },
    modeDesc: {
        "treble-basics": "Natural notes on the treble staff",
        "bass-basics": "Natural notes on the bass staff",
        intermediate: "Both clefs with sharps & flats",
        expert: "All notes, extended range",
    },
    mobileBlockerText:
        "A small web app for practicing reading sheet music faster. This site works best on bigger screens, so please try it on a desktop or tablet!",
};

const de: Translations = {
    appTitle: "QuickKey",
    streak: "Serie",
    best: "Beste",
    avg: "\u00D8",
    trebleClef: "Violinschl\u00FCssel",
    bassClef: "Bassschl\u00FCssel",
    modesHeading: "Modi",
    language: "Sprache",
    difficulty: {
        beginner: "Anf\u00E4nger",
        intermediate: "Fortgeschritten",
        expert: "Experte",
    },
    modeLabel: {
        "treble-basics": "Violinschl\u00FCssel",
        "bass-basics": "Bassschl\u00FCssel",
        intermediate: "Beide Schl\u00FCssel",
        expert: "Voller Umfang",
    },
    modeDesc: {
        "treble-basics": "Stammt\u00F6ne im Violinschl\u00FCssel",
        "bass-basics": "Stammt\u00F6ne im Bassschl\u00FCssel",
        intermediate: "Beide Schl\u00FCssel mit Vorzeichen",
        expert: "Alle Noten, erweiterter Umfang",
    },
    mobileBlockerText:
        "Eine kleine Web-App, um Notenlesen zu \u00DCben. Diese Seite funktioniert am besten auf gr\u00F6\u00DFeren Bildschirmen \u2014 bitte versuch es auf einem Desktop oder Tablet!",
};

const ko: Translations = {
    appTitle: "\uD035\uD0A4",
    streak: "\uC5F0\uC18D",
    best: "\uCD5C\uACE0",
    avg: "\uD3C9\uADE0",
    trebleClef: "\uB192\uC740\uC74C",
    bassClef: "\uB0AE\uC740\uC74C",
    modesHeading: "\uBAA8\uB4DC",
    language: "\uC5B8\uC5B4",
    difficulty: {
        beginner: "\uCD08\uAE09",
        intermediate: "\uC911\uAE09",
        expert: "\uC0C1\uAE09",
    },
    modeLabel: {
        "treble-basics": "\uB192\uC740\uC74C\uC790\uB9AC",
        "bass-basics": "\uB0AE\uC740\uC74C\uC790\uB9AC",
        intermediate: "\uC591\uC190 \uC5F0\uC2B5",
        expert: "\uC804\uCCB4 \uC74C\uC5ED",
    },
    modeDesc: {
        "treble-basics":
            "\uB192\uC740\uC74C\uC790\uB9AC\uD45C \uC790\uC5F0\uC74C",
        "bass-basics":
            "\uB0AE\uC740\uC74C\uC790\uB9AC\uD45C \uC790\uC5F0\uC74C",
        intermediate:
            "\uC591\uC190 \uC74C\uC790\uB9AC\uD45C, \uC62C\uB9BC\uD45C\uB0B4\uB9BC\uD45C \uD3EC\uD568",
        expert: "\uBAA8\uB4E0 \uC74C, \uD655\uC7A5\uB41C \uC74C\uC5ED",
    },
    mobileBlockerText:
        "\uC545\uBCF4 \uC77D\uAE30 \uC5F0\uC2B5\uC744 \uC704\uD55C \uC6F9 \uC571\uC785\uB2C8\uB2E4. \uD070 \uD654\uBA74\uC5D0\uC11C \uAC00\uC7A5 \uC798 \uC791\uB3D9\uD558\uB2C8, \uB370\uC2A4\uD06C\uD1B1\uC774\uB098 \uD0DC\uBE14\uB9BF\uC73C\uB85C \uC811\uC18D\uD574 \uC8FC\uC138\uC694!",
};

const allTranslations: Record<Locale, Translations> = { en, de, ko };

export function getTranslations(locale: Locale): Translations {
    return allTranslations[locale];
}

const LOCALE_KEY = "score-teacher-locale";

/** Auto-detect from browser, with localStorage override. */
export function detectLocale(): Locale {
    try {
        const saved = localStorage.getItem(LOCALE_KEY);
        if (saved === "en" || saved === "de" || saved === "ko") return saved;
    } catch {}

    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("ko")) return "ko";
    return "en";
}

export function saveLocale(locale: Locale): void {
    try {
        localStorage.setItem(LOCALE_KEY, locale);
    } catch {}
}
