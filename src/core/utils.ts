/**
 * Clamp a number into the 0-255 range and round it.
 * @module core/utils
 */
export const clampByte = (value: number): number => {
    if (typeof value !== 'number' || !isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 255) return 255;
    return Math.round(value);
};
