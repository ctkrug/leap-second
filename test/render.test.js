// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render } from '../src/render.js';

describe('render', () => {
  it('renders UTC, TAI, and GPS readouts into the root element', () => {
    const root = document.createElement('div');
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.textContent).toContain('UTC');
    expect(root.textContent).toContain('TAI');
    expect(root.textContent).toContain('GPS');
  });

  it('renders a countdown to the decision boundary', () => {
    const root = document.createElement('div');
    render(root, new Date('2026-07-10T00:00:00Z'));

    expect(root.textContent).toMatch(/\d+d \d{2}h \d{2}m \d{2}s/);
  });
});
