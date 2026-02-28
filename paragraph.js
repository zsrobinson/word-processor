export class Text {
    /**
     * @param {string} content
     * @param {Style} style
     */
    constructor(content, style) {
        this.content = content;
        this.style = style;
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
    ``;
    for (let curr = 0; curr < words.length; curr++) {
        end++;

        if (
            end >= words.length ||
            ctx.measureText(words.slice(start, end + 1).join(" ")).width >
                page.textWidth
        ) {
            const content = words.slice(start, end).join(" ");
            lines.push(new Text(content, para.style));
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
 */
export function paintLine(ctx, line, page, vOffset) {
    ctx.font = `${line.style.size}px ${line.style.family}`;
    ctx.fillStyle = line.style.color;

    const metrics = ctx.measureText(line.content);
    vOffset += metrics.fontBoundingBoxAscent;

    ctx.fillText(line.content, page.margin, vOffset);

    vOffset += metrics.fontBoundingBoxDescent;
    vOffset += line.style.size * (line.style.lineHeight - 1);
    return vOffset;
}
