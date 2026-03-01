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
}
