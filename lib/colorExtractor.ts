/**
 * Calculate the luminance of a color to determine if text should be white or black
 * Uses the relative luminance formula from WCAG
 */
export function getTextColor(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  // Formula: (0.299 * R + 0.587 * G + 0.114 * B)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

  // Return white for dark backgrounds, black for light backgrounds
  // Threshold: 128 (midpoint of 0-255)
  return luminance > 128 ? '#000000' : '#ffffff';
}
