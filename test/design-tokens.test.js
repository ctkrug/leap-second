import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Regression guard for WCAG contrast: parses the actual --accent/--surface-1 custom
// property values out of style.css so a future palette tweak can't silently reintroduce
// the 3.73:1 failure QA found on the annotation label and countdown decided-state text
// (both render var(--accent) text directly on var(--surface-1)).

function readToken(css, name) {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token ${name} not found`);
  return match[1];
}

function hexToRgb(hex) {
  const num = parseInt(hex.slice(1), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const channel = c / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
}

const css = readFileSync(fileURLToPath(new URL('../src/style.css', import.meta.url)), 'utf8');

describe('design tokens — WCAG contrast', () => {
  it('keeps --accent at >=4.5:1 against --surface-1 (annotation label, decided-state text)', () => {
    const accent = readToken(css, '--accent');
    const surface1 = readToken(css, '--surface-1');

    expect(contrastRatio(accent, surface1)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps --text-muted at >=4.5:1 against both --surface-1 and --bg', () => {
    const textMuted = readToken(css, '--text-muted');
    const surface1 = readToken(css, '--surface-1');
    const bg = readToken(css, '--bg');

    expect(contrastRatio(textMuted, surface1)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(textMuted, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps --text at >=4.5:1 against both --surface-1 and --bg', () => {
    const text = readToken(css, '--text');
    const surface1 = readToken(css, '--surface-1');
    const bg = readToken(css, '--bg');

    expect(contrastRatio(text, surface1)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
