// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render } from '../src/render.js';

function freshRoot() {
  return document.createElement('div');
}

describe('render — clock panels', () => {
  it('renders one panel per clock, each with an inline SVG dial', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    for (const key of ['utc', 'tai', 'gps']) {
      const panel = root.querySelector(`[data-clock="${key}"]`);
      expect(panel).not.toBeNull();
      expect(panel.querySelector('svg.dial')).not.toBeNull();
    }
  });

  it('keeps TAI exactly 37s and GPS exactly 18s ahead of UTC in the digital readout', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-field="readout"]').textContent).toBe(
      '00:00:00'
    );
    expect(root.querySelector('[data-clock="tai"] [data-field="readout"]').textContent).toBe(
      '00:00:37'
    );
    expect(root.querySelector('[data-clock="gps"] [data-field="readout"]').textContent).toBe(
      '00:00:18'
    );
  });

  it('re-renders the digital readout on a later call with the same root', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    render(root, new Date('2026-07-10T00:01:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-field="readout"]').textContent).toBe(
      '00:01:00'
    );
  });

  it('does not rebuild the DOM subtree on repeat renders, preserving element identity', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));
    const panelBefore = root.querySelector('[data-clock="utc"]');
    render(root, new Date('2026-07-10T00:00:01Z'));
    const panelAfter = root.querySelector('[data-clock="utc"]');

    expect(panelBefore).toBe(panelAfter);
  });

  it('renders an offset bar with an exact-seconds label for TAI and GPS, but not UTC', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.querySelector('[data-clock="utc"] [data-offset-bar]')).toBeNull();

    const tai = root.querySelector('[data-clock="tai"] [data-offset-bar]');
    const gps = root.querySelector('[data-clock="gps"] [data-offset-bar]');
    expect(tai.getAttribute('aria-label')).toBe('TAI is 37 seconds ahead of UTC');
    expect(gps.getAttribute('aria-label')).toBe('GPS is 18 seconds ahead of UTC');
  });

  it('scales the TAI and GPS offset bar fills proportionally to their offsets', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    const taiFill = root.querySelector('[data-clock="tai"] .offset-bar__fill');
    const gpsFill = root.querySelector('[data-clock="gps"] .offset-bar__fill');
    expect(Number(taiFill.getAttribute('width'))).toBeGreaterThan(
      Number(gpsFill.getAttribute('width'))
    );
    expect(Number(taiFill.getAttribute('width'))).toBe(100);
  });

  it('makes the offset bar focusable via keyboard', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(
      root.querySelector('[data-clock="tai"] [data-offset-bar]').getAttribute('tabindex')
    ).toBe('0');
  });
});

describe('render — countdown', () => {
  it('renders a countdown to the decision boundary', () => {
    const root = freshRoot();
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.querySelector('[data-field="countdown-value"]').textContent).toMatch(
      /\d+d \d{2}h \d{2}m \d{2}s/
    );
  });
});
