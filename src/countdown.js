/**
 * Countdown and odds tracker for the December 2026 leap-second decision.
 *
 * IERS publishes Bulletin C twice a year, announcing whether a leap second
 * will be inserted at the end of the following June or December. The last
 * leap second was at the end of 2016; none have been needed since, because
 * Earth's rotation rate has been drifting faster rather than slower — the
 * discussion in recent bulletins has shifted from "when is the next positive
 * leap second" to "will we ever need history's first negative one instead."
 * The 2022 CGPM resolution additionally commits to retiring the leap second
 * entirely by 2035. Both threads feed the odds estimate below.
 */

// The instant a leap second would be inserted, if IERS calls for one: the last
// second of 2026-12-31 UTC.
export const DECISION_INSTANT = new Date('2026-12-31T23:59:59Z');

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * @param {Date} now
 * @param {Date} target
 * @returns {{ totalMs: number, days: number, hours: number, minutes: number, seconds: number, isPast: boolean }}
 */
export function timeRemaining(now = new Date(), target = DECISION_INSTANT) {
  const totalMs = target.getTime() - now.getTime();
  const isPast = totalMs <= 0;
  const abs = Math.abs(totalMs);

  return {
    totalMs,
    isPast,
    days: Math.floor(abs / MS_PER_DAY),
    hours: Math.floor((abs % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((abs % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((abs % MS_PER_MINUTE) / MS_PER_SECOND),
  };
}

/**
 * A working estimate of the odds for the December 2026 decision, with the
 * reasoning behind it. This is a static, hand-maintained estimate — not a
 * live feed — updated as IERS bulletins and rotation data come in.
 */
export const ODDS = {
  asOf: '2026-07-10',
  outcomes: [
    {
      label: 'No leap second inserted',
      probability: 0.95,
      reasoning:
        "IERS has called for no leap second at every boundary since 2016, and Earth's " +
        'rotation has been trending faster (shortening the day), which points away from ' +
        'the traditional positive leap second entirely.',
    },
    {
      label: 'Positive leap second inserted (+1s)',
      probability: 0.03,
      reasoning:
        'The historical default outcome, but increasingly unlikely given the recent ' +
        'rotation-rate trend; would require UT1-UTC to drift past the insertion threshold ' +
        'before the bulletin deadline.',
    },
    {
      label: 'Negative leap second inserted (-1s)',
      probability: 0.02,
      reasoning:
        "Earth's rotation has sped up enough in recent years that a negative leap second " +
        '— skipping a second, never done before — has moved from theoretical to plausible, ' +
        'just probably not yet at this specific boundary.',
    },
  ],
};
