/**
 * Shared default props for GlowingEffect component.
 * Use this to ensure consistent glow behavior across all card components.
 */
export const GLOW_DEFAULTS = {
  spread: 40,
  glow: true,
  disabled: false,
  proximity: 64,
  inactiveZone: 0.01,
  borderWidth: 2,
} as const;
