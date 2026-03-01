/** @typedef {[number, number]} NumRange */

/**
 * @param {NumRange} a
 * @param {NumRange} b
 * @returns {NumRange | null}
 */
export function rangeIntersect(a, b) {
    const [a1, a2, b1, b2] = [...a, ...b];
    if (a1 > a2 || b1 > b2) throw new Error("Invalid range");

    if (a2 < b1 || b2 < a1) return null;
    return [Math.max(a1, b1), Math.min(a2, b2)];
}
