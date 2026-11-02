/**
 * Frame Configuration & Scrollytelling Constants for KAFI Gulberg
 */

export const TOTAL_FRAMES = 300;

/**
 * Returns the URL for a specific 1-indexed frame number
 * @param {number} frameNumber - 1 to 300
 * @returns {string} Relative URL to the frame image
 */
export function getFrameUrl(frameNumber) {
  const paddedIndex = String(Math.max(1, Math.min(TOTAL_FRAMES, frameNumber))).padStart(3, '0');
  return `/frames/ezgif-frame-${paddedIndex}.webp`;
}

/**
 * Scrollytelling milestones and chapter breakpoints (0.0 to 1.0 scroll range)
 */
export const SCROLL_MILESTONES = {
  HERO: {
    start: 0.0,
    peak: 0.08,
    end: 0.25,
    title: "KAFI Gulberg",
    subtitle: "Specialty Coffee & Ambiance",
  },
  VIBES: {
    start: 0.32,
    peak: 0.44,
    end: 0.62,
    title: "From Exterior Vibes to Artisan Roasts",
    subtitle: "Gulberg III, Lahore",
  },
  CTA: {
    start: 0.72,
    peak: 0.85,
    end: 1.0,
    title: "Explore Menu & Order Direct",
    subtitle: "0% Commission — Freshly Brewed to Order",
  },
};
