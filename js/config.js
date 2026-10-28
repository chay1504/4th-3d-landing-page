/**
 * NOCTIS Configuration & Tuning Parameters
 * All scroll heights, frame counts, chapter ranges, and callout positions
 * are unified here for effortless adjustment.
 */
export const CONFIG = {
  // Brand & General
  brandName: 'NOCTIS',
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Preloader
  preloader: {
    priorityFrameCount: 40, // Frames loaded before revealing site
    initialDelayMs: 300,
  },

  // Section 1: Hero
  hero: {
    scrollDistance: '+=500%', // 5 viewport heights of pure pinned scroll
    frameCount: 450,
    desktopPath: 'frames/hero/frame_{index}.webp',
    mobilePath: 'frames/hero-mobile/frame_{index}.webp',
    smoothLerp: 0.15, // current += (target - current) * 0.15
    fadeToBlackStart: 0.95, // Canvas fades to pure black over the last 5% of scroll
    hud: {
      maxSpeed: 118, // KM/H
      maxDistance: 4.2, // KM
    },
    chapters: [
      {
        id: 1,
        range: [0.0, 0.12],
        hudTitle: '01/04',
        headline: 'NOCTIS',
        subline: 'The city is asleep.',
        hint: 'SCROLL TO WAKE IT'
      },
      {
        id: 2,
        range: [0.22, 0.40],
        hudTitle: '02/04',
        headline: "It doesn't need the city's light.",
        subline: ''
      },
      {
        id: 3,
        range: [0.50, 0.68],
        hudTitle: '03/04',
        headline: 'It brings its own.',
        subline: ''
      },
      {
        id: 4,
        range: [0.80, 1.00],
        hudTitle: '04/04',
        headline: 'GT-E',
        specs: '0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR',
        linkText: 'Discover the GT-E',
        linkHref: '#reserve-section'
      }
    ]
  },

  // Section 2: Statement
  statement: {
    tag: '02 — ENGINEERING',
    text: 'Every part was designed to disappear into one line of light.'
  },

  // Section 3: Exploded View
  explode: {
    scrollDistance: '+=300%', // 3 viewport heights of pure pinned scroll
    frameCount: 180,
    desktopPath: 'frames/explode/frame_{index}.webp',
    mobilePath: 'frames/explode-mobile/frame_{index}.webp',
    smoothLerp: 0.15,
    calloutThreshold: 0.70, // Callouts begin fading in after 70% progress
    callouts: [
      {
        id: 'body',
        title: 'BODY',
        description: 'Carbon composite monocoque',
        // Coordinates as percentages of the canvas display area [0..100]
        dot: { x: 38, y: 34 },
        card: { x: 18, y: 22 },
        revealProgress: 0.72
      },
      {
        id: 'battery',
        title: 'BATTERY',
        description: '110 kWh structural pack',
        dot: { x: 56, y: 72 },
        card: { x: 68, y: 76 },
        revealProgress: 0.78
      },
      {
        id: 'drive',
        title: 'DRIVE',
        description: 'Dual axial-flux motors, 680 kW',
        dot: { x: 30, y: 62 },
        card: { x: 12, y: 70 },
        revealProgress: 0.84
      },
      {
        id: 'light',
        title: 'LIGHT',
        description: 'Single-line LED signature',
        dot: { x: 16, y: 52 },
        card: { x: 8, y: 44 },
        revealProgress: 0.90
      }
    ]
  },

  // Section 4: Reserve
  reserve: {
    headline: 'Drive the night.',
    bodyText: 'Limited allocation for 2026 delivery. Priority access opens to reservation holders.',
    buttonText: 'RESERVE YOUR NOCTIS'
  }
};
