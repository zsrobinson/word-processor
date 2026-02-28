export class Text {
    /**
     * @param {string} content
     * @param {Style} style
     * @param {number} letterIndex
     */
    constructor(content, style, letterIndex) {
        this.content = content;
        this.style = style;
        this.letterIndex = letterIndex;
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {Text} para
 * @param {Page} page
 * @returns {Text[]}
 */
export function renderPara(ctx, para, page) {
    /** @type {Text[]} */
    const lines = [];
    const words = para.content.split(" ");
    ctx.font = `${para.style.size}px ${para.style.family}`;

    let start = 0;
    let end = 0;
    let letterIndex = para.letterIndex;

    for (let curr = 0; curr < words.length; curr++) {
        end++;

        if (
            end >= words.length ||
            ctx.measureText(words.slice(start, end + 1).join(" ")).width >
                page.textWidth
        ) {
            let content = words.slice(start, end).join(" ");

            lines.push(new Text(content, para.style, letterIndex));
            letterIndex += content.length + 1;
            start = end;
        }
    }

    return lines;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Text} line
 * @param {Page} page
 * @param {number} vOffset
 * @param {number | undefined} cursor
 */
export function paintLine(ctx, line, page, vOffset, cursor) {
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
            vOffset,
            line.style.size / 10,
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
        );
        ctx.fillStyle = "teal";
        ctx.fill();
    }

    // draw text
    ctx.fillStyle = line.style.color;
    const metrics = ctx.measureText(line.content);
    vOffset += metrics.fontBoundingBoxAscent;

    ctx.fillText(line.content, page.margin, vOffset);

    vOffset += metrics.fontBoundingBoxDescent;
    vOffset += line.style.size * (line.style.lineHeight - 1);
    return vOffset;
}
