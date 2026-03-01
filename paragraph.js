export class Para {
    /**
     * @param {string} content
     * @param {Style} style
     */
    constructor(content, style) {
        this.content = content;
        this.style = style;
    }
}

export class Line {
    /**
     * @param {string} content
     * @param {Style} style
     * @param {number} letterIndex
     * @param {number} vOffset
     */
    constructor(content, style, letterIndex, vOffset) {
        this.content = content;
        this.style = style;
        this.letterIndex = letterIndex;
        this.vOffset = vOffset;
    }
}

export class Style {
    /**
     * @param {string} family
     * @param {number} size
     * @param {number} lineHeight
     * @param {string} color */
    constructor(family, size, lineHeight, color) {
        this.family = family;
        this.size = size;
        this.lineHeight = lineHeight;
        this.color = color;
    }
}

export class Page {
    /**
     * @param {number} width
     * @param {number} margin
     */
    constructor(width, margin) {
        this.width = width;
        this.margin = margin;
        this.textWidth = width - margin * 2;
    }
}

/**
 * Splits apart a continuous paragraph into discrete lines given the document's
 * page information. Embeds `letterIndex` information so that cursor data is
 * included within the returned line objects. Also returns the updated
 * `letterIndex` and `vOffset` for subsequent calls to this function.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Para} para
 * @param {Page} page
 * @param {number} letterIndex
 * @param {number} vOffset
 * @returns {[Line[], number, number]}
 */
export function renderPara(ctx, para, page, letterIndex, vOffset) {
    /** @type {Line[]} */
    const lines = [];
    const words = para.content.split(" ");
    ctx.font = `${para.style.size}px ${para.style.family}`;

    let start = 0;
    let end = 0;

    for (let curr = 0; curr < words.length; curr++) {
        end++;

        const plusOneMetrics = ctx.measureText(
            words.slice(start, end + 1).join(" "),
        );

        if (end >= words.length || plusOneMetrics.width > page.textWidth) {
            const content = words.slice(start, end).join(" ");
            const metrics = ctx.measureText(content);

            lines.push(new Line(content, para.style, letterIndex, vOffset));
            vOffset += metrics.fontBoundingBoxAscent;
            vOffset += metrics.fontBoundingBoxDescent;
            vOffset += para.style.size * (para.style.lineHeight - 1);

            letterIndex += content.length + 1;
            start = end;
        }
    }

    return [lines, letterIndex, vOffset];
}

/**
 * Draws a line of text on the canvas at its given vOffset. Also uses its given
 * letterIndex to draw the cursor if the current index is in range.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Line} line
 * @param {Page} page
 * @param {number | undefined} cursor
 * @param {number | undefined} cursorRED
 */
export function paintLine(ctx, line, page, cursor, cursorRED) {
    ctx.font = `${line.style.size}px ${line.style.family}`;

    // draw cursor
    if (
        cursor !== undefined &&
        line.letterIndex <= cursor &&
        cursor <= line.letterIndex + line.content.length
    ) {
        const cursorText = line.content.slice(0, cursor - line.letterIndex);
        const metrics = ctx.measureText(cursorText);

        ctx.beginPath();
        ctx.rect(
            metrics.width + page.margin,
            line.vOffset,
            line.style.size / 10,
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
        );
        ctx.fillStyle = "teal";
        ctx.fill();
    }

    // draw cursor
    if (
        cursorRED !== undefined &&
        line.letterIndex <= cursorRED &&
        cursorRED <= line.letterIndex + line.content.length
    ) {
        const cursorREDText = line.content.slice(
            0,
            cursorRED - line.letterIndex,
        );
        const metrics = ctx.measureText(cursorREDText);

        ctx.beginPath();
        ctx.rect(
            metrics.width + page.margin,
            line.vOffset,
            line.style.size / 10,
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
        );
        ctx.fillStyle = "red";
        ctx.fill();
    }

    // draw text
    const metrics = ctx.measureText(line.content);
    ctx.fillStyle = line.style.color;
    ctx.fillText(
        line.content,
        page.margin,
        line.vOffset + metrics.fontBoundingBoxAscent,
    );
}
