import { Doc } from "./document.js";
import { lorem } from "./lorem.js";
import { Page, paintLine, Para, Style } from "./paragraph.js";

const canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("canvas")
);

const zoomSelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("zoom-select")
);

const familySelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("family-select")
);

const sizeSelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("size-select")
);

const leadingSelect = /** @type {HTMLSelectElement} */ (
    document.getElementById("leading-select")
);

const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));

var text = lorem;
var isFocused = false;

var lastAdded = 0;
var cursor = text.length;
/** @type {number | undefined} */
var cursorRED = text.length;
var selecting = false;

var zoom = 100;
var family = "serif";
var size = 12;
var leading = 1.15;

/** @type {Doc} */
var doc;

/* EVENT HANDLERS */

canvas.addEventListener("focus", (e) => {
    isFocused = true;
    lastAdded = Date.now();
});

canvas.addEventListener("blur", () => {
    isFocused = false;
});

zoomSelect.addEventListener("change", (e) => {
    zoom = Number(/** @type {HTMLSelectElement} */ (e.target).value);
});

familySelect.addEventListener("change", (e) => {
    family = /** @type {HTMLSelectElement} */ (e.target).value;
});

sizeSelect.addEventListener("change", (e) => {
    size = Number(/** @type {HTMLSelectElement} */ (e.target).value);
});

leadingSelect.addEventListener("change", (e) => {
    leading = Number(/** @type {HTMLSelectElement} */ (e.target).value);
});

function removeSelection() {
    if (cursorRED !== undefined) {
        text =
            text.substring(0, Math.min(cursor, cursorRED)) +
            text.substring(Math.max(cursor, cursorRED), text.length);
        cursor = Math.min(cursor, cursorRED);
        cursorRED = undefined;
    }
}

canvas.addEventListener("keydown", (e) => {
    e.preventDefault();
    lastAdded = Date.now();

    if (e.key === "Backspace") {
        if (cursor == 0) return;
        if (cursorRED == undefined) {
            text = text.substring(0, cursor - 1) + text.substring(cursor);
            cursor -= 1;
        } else {
            removeSelection();
        }
    } else if (e.key === "Enter") {
        if (cursorRED !== undefined) removeSelection();
        text = text.substring(0, cursor) + "\n" + text.substring(cursor);
        cursor += 1;
    } else if (e.key === "Shift") {
        /* no-op */
    } else if (e.key === "Meta") {
        /* no-op */
    } else if (e.key === "ArrowLeft") {
        if (cursor == 0) return;
        cursor -= 1;
        cursorRED = undefined;
    } else if (e.key === "ArrowRight") {
        if (cursor < text.length) cursor += 1;
        cursorRED = undefined;
    } else if (e.key === "ArrowUp") {
        /* no-op */
    } else if (e.key === "ArrowDown") {
        /* no-op */
    } else {
        // normal key press
        if (cursorRED !== undefined) removeSelection();
        text = text.substring(0, cursor) + e.key + text.substring(cursor);
        cursor += 1;
    }
});

canvas.addEventListener("mousedown", (e) => {
    const [x, y] = [e.offsetX, e.offsetY];
    const closestLine = doc.getClosestLine(y);
    const closestLetter = doc.getClosestLetter(closestLine, x);
    cursorRED = undefined;
    cursor = closestLetter;
    lastAdded = Date.now();
    selecting = true;
});

canvas.addEventListener("mousemove", (e) => {
    if (!selecting) return;

    const [x, y] = [e.offsetX, e.offsetY];
    const closestLine = doc.getClosestLine(y);
    const closestLetter = doc.getClosestLetter(closestLine, x);
    cursorRED = closestLetter;
    lastAdded = Date.now();

    if (cursorRED === cursor) {
        cursorRED = undefined;
    }
});

canvas.addEventListener("mouseup", () => (selecting = false));

/* ENTRYPOINT */

function main() {
    requestAnimationFrame(paint);
}

/* PAINT LOOP */

function paint() {
    const inch = 100 * (zoom / 100);
    const [width, height] = [8.5 * inch, 11 * inch]; // 8.5x11 inches

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.scale(scale, scale);

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
    const sizePx = (inch / 72) * size;
    const margin = inch; // 1 inch

    const page = new Page(width, margin);
    const style = new Style(family, sizePx, leading, "black");
    const paras = text.split("\n").map((t) => new Para(t, style));

    doc = new Doc(ctx, page, paras);
    const lines = doc.getLines();
    lines.forEach((line) => paintLine(ctx, line, page, cursor, cursorRED));

    requestAnimationFrame(paint);
}

main();
