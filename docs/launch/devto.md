---
title: 'Skew: watching UTC, TAI and GPS disagree, and counting down to the 2026 leap second'
published: false
tags: javascript, webdev, svg, testing
---

Every clock you own lies to you a little. Your phone shows UTC (or a local offset of it) and
quietly implies that time is one uniform counter everybody agrees on. It isn't. Right now,
atomic time (TAI) runs 37 seconds ahead of UTC, and GPS time runs 18 seconds ahead, and both
gaps are frozen constants that only move when the world inserts a leap second.

I wanted to see that disagreement instead of reading it from a table, so I built
[Skew](https://apps.charliekrug.com/leap-second/): three clock dials ticking side by side, plus
a countdown to the December 2026 leap-second decision and a running estimate of the odds. Here
are the two build decisions I found most interesting.

## Mount once, patch per tick

The obvious way to render a clock that updates every second is to rebuild the DOM on every
tick:

```js
setInterval(() => {
  root.innerHTML = buildMarkup(new Date());
}, 1000);
```

This works right up until you add anything interactive. The offset bars under TAI and GPS are
focusable and show a tooltip on hover and keyboard focus. Blow away `innerHTML` every second
and you drop keyboard focus and close any open tooltip once a second, which is unusable.

So `render.js` splits the work in two. `mount(root)` runs once, guarded by a
`root.dataset.mounted` flag, and builds the whole static structure. `update(root, now)` runs
every tick and only touches the handful of nodes that actually change: the hand `transform`
attributes, the digital readouts, the countdown digits, and one `annotation--active` class.
There is a test that asserts element identity survives a re-render, so nobody reintroduces the
innerHTML approach by accident:

```js
const before = root.querySelector('[data-clock="utc"]');
render(root, later);
const after = root.querySelector('[data-clock="utc"]');
expect(before).toBe(after);
```

A separate test renders 1000 simulated ticks and asserts the total DOM node count never moves,
so a future patch can't leak nodes.

## Keep the math pure, then property-test it

The one part of this app that absolutely has to be correct is the offset arithmetic. TAI is 37
seconds ahead of UTC; GPS is 18; TAI is always exactly 19 seconds ahead of GPS. If any of those
is wrong the whole premise falls apart.

So every bit of time math lives in plain functions over `Date` with no DOM and no timers:
`toTAI`, `toGPS`, `timeRemaining`, `handAngles`, `offsetBarWidthPercent`. That makes them cheap
to property-test with [fast-check](https://fast-check.dev/). Instead of a handful of hand-picked
instants, I assert invariants over thousands of random dates:

```js
fc.assert(
  fc.property(anyInstant, (utc) => {
    const { utc: u, tai, gps } = currentClocks(utc);
    expect(u.getTime()).toBeLessThanOrEqual(gps.getTime());
    expect(gps.getTime()).toBeLessThanOrEqual(tai.getTime());
  }),
);
```

The countdown got the same treatment: for any two instants, the day/hour/minute/second parts
must be non-negative, stay in range, and reconstruct the total gap to within a second. That
caught the boring-but-real edge where `now` exactly equals the target, which should read as
"decided," not as a one-second countdown.

## One thing QA caught

The accent orange started at `#e2572b`. It looked fine, but at the small text sizes where it
actually appears (the 0.7rem annotation label, the countdown's decided-state message) it only
hit 3.73:1 against the paper background, short of WCAG AA's 4.5:1. I darkened it to `#cd471c`,
same hue, and added a test that parses the real token values out of the CSS and fails if any
text color ever drops below 4.5:1 again.

## What I'd change

The odds are a static, hand-maintained estimate with cited reasoning, refreshed when a new IERS
bulletin lands. If I kept iterating, I would wire the countdown's "decided" state to actually
read the latest Bulletin C rather than just pointing you at it.

Code is on [GitHub](https://github.com/ctkrug/leap-second), live version is
[here](https://apps.charliekrug.com/leap-second/). Feedback welcome.
