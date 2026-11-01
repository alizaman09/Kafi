/**
 * Math & Interpolation Utilities for High-Performance Scrollytelling
 */

/**
 * Linear interpolation between two values
 * @param {number} start - Initial value
 * @param {number} end - Target value
 * @param {number} factor - Smoothing factor (0.0 to 1.0)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Clamp a number between min and max bounds
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Maps a value from one range to another
 * @param {number} value 
 * @param {number} inMin 
 * @param {number} inMax 
 * @param {number} outMin 
 * @param {number} outMax 
 * @returns {number}
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const normalized = (value - inMin) / (inMax - inMin);
  return outMin + normalized * (outMax - outMin);
}
