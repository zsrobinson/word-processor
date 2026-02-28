import { Text, Style, Page, renderPara, paintLine } from "./paragraph.js";

const canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("canvas")
);

const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));

var text = "";
var isFocused = false;
var cursor = text.length;
var lastAdded = 0;
const [width, height] = [850 / 2, 1100 / 2]; // 8.5x11 inches

/* EVENT HANDLERS */

canvas.addEventListener("focus", () => {
    isFocused = true;
    lastAdded = Date.now();
});

canvas.addEventListener("blur", () => {
    isFocused = false;
});

canvas.addEventListener("keydown", (e) => {
    lastAdded = Date.now();

    if (e.key === "Backspace") {
        if (cursor == 0) return;
        text = text.substring(0, cursor - 1) + text.substring(cursor);
        cursor -= 1;
    } else if (e.key === "Enter") {
        text = text.substring(0, cursor) + "\n" + text.substring(cursor);
        cursor += 1;
    } else if (e.key === "Shift") {
        /* no-op */
    } else if (e.key === "Meta") {
        /* no-op */
    } else if (e.key === "ArrowLeft") {
        if (cursor == 0) return;
        cursor -= 1;
    } else if (e.key === "ArrowRight") {
        cursor += 1;
    } else if (e.key === "ArrowUp") {
        /* no-op */
    } else if (e.key === "ArrowDown") {
        /* no-op */
    } else {
        // normal key press
        text = text.substring(0, cursor) + e.key + text.substring(cursor);
        cursor += 1;
    }
});

/* ENTRYPOINT */

function main() {
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);

    requestAnimationFrame(paint);
}

/* PAINT LOOP */

function paint() {
    // clear previous contents
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();

    // get cursor state
    const interval = 500;
    const blink = Math.round((Date.now() - lastAdded) / interval) % 2 == 1;
    const recentAdd = Date.now() - lastAdded < interval * 1.5;
    const cursorShowing = isFocused && (recentAdd || blink);

    // variables
    const family = "Times New Roman";
    const sizePt = 48;
    const size = (100 / 2 / 72) * sizePt;
    const margin = 100 / 2; // 1 inch
    const lineHeight = 1;

    const page = new Page(width, margin);
    const style = new Style(family, size, lineHeight, "black");

    // construct paragraphs from text with letterIndex information
    /** @type {Text[]} */
    const paras = [];
    text.split("\n").reduce((acc, curr) => {
        paras.push(new Text(curr, style, acc));
        return acc + curr.length + 1; // extra 1 for newline char
    }, 0);

    // convert paragraphs into individual lines
    const lines = paras.map((p) => renderPara(ctx, p, page)).flat();

    // paint lines onto the screen
    lines.reduce(
        (acc, curr) =>
            paintLine(ctx, curr, page, acc, cursorShowing ? cursor : undefined),
        page.margin,
    );

    requestAnimationFrame(paint);
}

main();
