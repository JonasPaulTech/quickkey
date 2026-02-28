<script lang="ts">
  import { MODES, type Mode } from "../lib/music";
  import type { Locale, Translations } from "../lib/i18n";

  let {
    mode,
    locale,
    t,
    onchange,
    onlocalechange,
  }: {
    mode: Mode;
    locale: Locale;
    t: Translations;
    onchange: (m: Mode) => void;
    onlocalechange: (l: Locale) => void;
  } = $props();

  const colors: Record<string, string> = {
    beginner: "var(--accent-beginner)",
    intermediate: "var(--accent-intermediate)",
    expert: "var(--accent-expert)",
  };
</script>

<nav class="sidebar">
  <span class="heading">{t.modesHeading}</span>
  <div class="modes">
    {#each MODES as m}
      <button
        class="mode"
        class:active={mode === m.id}
        style:--accent={colors[m.difficulty]}
        onclick={() => onchange(m.id)}
      >
        <span class="difficulty">{t.difficulty[m.difficulty]}</span>
        <span class="label">{t.modeLabel[m.id]}</span>
        <span class="desc">{t.modeDesc[m.id]}</span>
      </button>
    {/each}
  </div>

  <div class="lang-section">
    <span class="heading">{t.language}</span>
    <div class="lang-toggle">
      <button
        class="lang-btn"
        class:active={locale === "en"}
        onclick={() => onlocalechange("en")}
      >EN</button>
      <button
        class="lang-btn"
        class:active={locale === "de"}
        onclick={() => onlocalechange("de")}
      >DE</button>
      <button
        class="lang-btn"
        class:active={locale === "ko"}
        onclick={() => onlocalechange("ko")}
      >KO</button>
    </div>
  </div>
</nav>

<style>
  .sidebar {
    width: 200px;
    flex-shrink: 0;
    padding: 28px 14px;
    border-right: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .heading {
    font-family: var(--font-mono);
    font-size: 0.88rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding-left: 4px;
  }

  .modes {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mode {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px 12px;
    border: none;
    border-left: 3px solid transparent;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    text-align: left;
    width: 100%;
  }

  .mode:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .mode.active {
    background: rgba(255, 255, 255, 0.05);
    border-left-color: var(--accent);
  }

  .difficulty {
    font-family: var(--font-mono);
    font-size: 0.77rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
    font-weight: 500;
  }

  .label {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
  }

  .desc {
    font-family: var(--font-body);
    font-size: 0.86rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .lang-section {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .lang-toggle {
    display: flex;
    gap: 4px;
    padding-left: 4px;
  }

  .lang-btn {
    font-family: var(--font-mono);
    font-size: 0.83rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    padding: 4px 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .lang-btn:hover {
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-primary);
  }

  .lang-btn.active {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.2);
  }
</style>
