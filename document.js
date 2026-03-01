import { Line, Page, Para, renderPara } from "./paragraph.js";

export class Doc {
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {Page} page
     * @param {Para[]} paras
     */
    constructor(ctx, page, paras) {
        this.ctx = ctx;
        this.page = page;
        this.paras = paras;
    }

    /**
     * Progressively renders all paragraphs of the document into lines.
     *
     * @see {@link renderPara}
     */
    getLines() {
        /** @type {Line[]} */
        const lines = [];
        this.paras.reduce(
            (acc, curr) => {
                const [letterIndex, vOffset] = acc;
                const [paraLines, newLetterIndex, newVOffset] = renderPara(
                    this.ctx,
                    curr,
                    this.page,
                    letterIndex,
                    vOffset,
                );
                lines.push(...paraLines);
                return [newLetterIndex, newVOffset];
            },
            [0, this.page.margin],
        );
        return lines;
    }

    /**
     * Returns the closest line in the document to the given y value based on
     * the vOffset values of the lines.
     *
     * @param {number} y
     */
    getClosestLine(y) {
        const lines = this.getLines();
        var closest = /** @type {Line} */ (lines.at(0));
        for (let line of lines) {
            if (line.vOffset > y) return closest;
            closest = line;
        }
        return closest;
    }

    /**
     * @param {number} cursor
     */
    getClosestLineFromCursor(cursor) {
        const lines = this.getLines();
        var line = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].letterIndex > cursor) break;
            line = i;
        }
        const curr = /** @type {Line} */ (lines.at(line));
        return {
            up: /** @type {Line} */ (lines.at(Math.max(0, line - 1))),
            curr,
            down: /** @type {Line} */ (
                lines.at(Math.min(line + 1, lines.length - 1))
            ),
        };
    }

    /**
     * @param {Line} line
     * @param {number} cursor
     */
    getXPositionFromCursor(line, cursor) {
        if (
            cursor < line.letterIndex ||
            cursor > line.letterIndex + line.content.length
        )
            throw new Error("Cursor outside provided line");

        const text = line.content.slice(0, cursor - line.letterIndex);
        const metrics = this.ctx.measureText(text);
        return metrics.width + this.page.margin;
    }

    /**
     * Returns the closest letterIndex on some line given the provided x value
     * based on the metrics of the text.
     *
     * @param {Line} line
     * @param {number} x
     */
    getClosestLetter(line, x) {
        for (let i = 0; i < line.content.length; i++) {
            const text = line.content.slice(0, i);
            const metrics = this.ctx.measureText(text);

            if (x < this.page.margin + metrics.width) {
                return line.letterIndex + Math.max(0, i - 1);
            }
        }

        return line.letterIndex + line.content.length;
    }
}
