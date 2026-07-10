import { currentClocks } from './clocks.js';
import { timeRemaining, DECISION_INSTANT } from './countdown.js';

function formatClock(date) {
  return date.toISOString().replace('T', ' ').replace('Z', ' UTC-frame');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Minimal scaffold-level readout: numeric UTC/TAI/GPS values and a countdown.
 * The full SVG dial + offset-bar + annotation-sweep treatment from
 * docs/DESIGN.md is a BUILD-phase story.
 */
export function render(root, now = new Date()) {
  const { utc, tai, gps } = currentClocks(now);
  const remaining = timeRemaining(now, DECISION_INSTANT);

  root.innerHTML = `
    <h1>Leap Second</h1>
    <p class="muted">UTC vs TAI vs GPS, live — and a countdown to the Dec 2026 decision.</p>
    <section class="panel" aria-label="clocks">
      <div><span class="muted">UTC</span> <span class="clock-value">${formatClock(utc)}</span></div>
      <div><span class="muted">TAI</span> <span class="clock-value">${formatClock(tai)}</span></div>
      <div><span class="muted">GPS</span> <span class="clock-value">${formatClock(gps)}</span></div>
    </section>
    <section class="panel" aria-label="countdown" style="margin-top: 16px;">
      <span class="muted">Time to the Dec 2026 decision boundary</span>
      <div class="clock-value">${remaining.days}d ${pad(remaining.hours)}h ${pad(remaining.minutes)}m ${pad(remaining.seconds)}s</div>
    </section>
  `;
}
