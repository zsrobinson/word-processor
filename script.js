import { Doc } from "./document.js";
import { Page, paintLine, Para, Style } from "./paragraph.js";
import { declaration } from "./placeholder.js";

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

const resetButton = /** @type {HTMLButtonElement} */ (
    document.getElementById("reset-button")
);

const saveButton = /** @type {HTMLButtonElement} */ (
    document.getElementById("save-button")
);

const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext("2d"));

/** @type {string} */
var text;
var isFocused = false;

var lastAdded = 0;
var cursor = 0;
/** @type {number | undefined} */
var cursorRED;
var selecting = false;

/** @type {number} */
var zoom;
/** @type {string} */
var family = "serif";
/** @type {number} */
var size;
/** @type {number} */
var leading;

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
    saveToLocalStorage();
});

familySelect.addEventListener("change", (e) => {
    family = /** @type {HTMLSelectElement} */ (e.target).value;
    saveToLocalStorage();
});

sizeSelect.addEventListener("change", (e) => {
    size = Number(/** @type {HTMLSelectElement} */ (e.target).value);
    saveToLocalStorage();
});

leadingSelect.addEventListener("change", (e) => {
    leading = Number(/** @type {HTMLSelectElement} */ (e.target).value);
    saveToLocalStorage();
});

resetButton.addEventListener("click", () => {
    const yay = window.confirm("Are you sure you want to reset your document?");
    if (!yay) return;

    text = "";
    loadDefaults(true);
    updateHTMLInputs();
    saveToLocalStorage();
});

saveButton.addEventListener("click", () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "document.txt";
    link.click();
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

/**
 * Checks if the generic modifier key is pressed (command on mac, control on
 * windows). Uses a deprecated property to check which platform you're on.
 *
 * @param {KeyboardEvent} e
 * @return {boolean}
 * @see {@link https://www.bennadel.com/blog/4090-capturing-keyboard-event-modifiers-across-operating-systems-in-javascript.htm}
 */
function modifierKey(e) {
    const isMacish = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
    return isMacish ? e.metaKey : e.ctrlKey;
}

function saveToLocalStorage() {
    localStorage.setItem(
        "data",
        JSON.stringify({ text, family, size, leading }),
    );
}

function loadFromLocalStorage() {
    const raw = localStorage.getItem("data");
    if (raw === null) return;
    const data = JSON.parse(raw);
    text = data.text;
    family = data.family;
    size = data.size;
    leading = data.leading;
}

/** @param {boolean} force  */
function loadDefaults(force = false) {
    if (zoom === undefined || force) zoom = 100;
    if (family === undefined || force) family = "serif";
    if (size === undefined || force) size = 12;
    if (leading === undefined || force) leading = 1.15;
    if (text === undefined || force) text = declaration;
    cursor = 0;
}

function updateHTMLInputs() {
    zoomSelect.value = String(zoom);
    familySelect.value = family;
    sizeSelect.value = String(size);
    leadingSelect.value = String(leading);
}

canvas.addEventListener("keydown", (e) => {
    e.preventDefault();
    lastAdded = Date.now();

    if (e.key === "Backspace") {
        if (cursorRED !== undefined) {
            removeSelection();
        } else if (cursor !== 0) {
            text = text.substring(0, cursor - 1) + text.substring(cursor);
            cursor -= 1;
        }
    } else if (e.key === "Enter") {
        if (cursorRED !== undefined) removeSelection();
        text = text.substring(0, cursor) + "\n" + text.substring(cursor);
        cursor += 1;
    } else if (e.key === "Shift") {
        /* no-op */
    } else if (e.key === "Meta") {
        /* no-op */
    } else if (e.key === "Control") {
        /* no-op */
    } else if (e.key === "Alt") {
        /* no-op */
    } else if (e.key === "CapsLock") {
        /* no-op */
    } else if (e.key === "Escape") {
        /* no-op */
    } else if (e.key === "Tab") {
        /* no-op */
    } else if (e.key === "ArrowLeft") {
        if (cursor == 0) return;
        cursor -= 1;
        cursorRED = undefined;
    } else if (e.key === "ArrowRight") {
        if (cursor < text.length) cursor += 1;
        cursorRED = undefined;
    } else if (e.key === "ArrowUp") {
        const { up, curr } = doc.getClosestLineFromCursor(cursor);
        const x = doc.getXPositionFromCursor(curr, cursor);
        const letter = doc.getClosestLetter(up, x);
        cursor = letter;
    } else if (e.key === "ArrowDown") {
        const { down, curr } = doc.getClosestLineFromCursor(cursor);
        const x = doc.getXPositionFromCursor(curr, cursor);
        const letter = doc.getClosestLetter(down, x);
        cursor = letter;
    } else if (e.key === "a" && modifierKey(e)) {
        cursor = 0;
        cursorRED = text.length;
    } else if (e.key === "c" && modifierKey(e)) {
        if (cursorRED === undefined) return;
        const data = text.substring(
            Math.min(cursor, cursorRED),
            Math.max(cursor, cursorRED),
        );
        window.navigator.clipboard.writeText(data);
    } else if (e.key === "x" && modifierKey(e)) {
        if (cursorRED === undefined) return;
        const data = text.substring(
            Math.min(cursor, cursorRED),
            Math.max(cursor, cursorRED),
        );
        removeSelection();
        window.navigator.clipboard.writeText(data);
    } else if (e.key === "v" && modifierKey(e)) {
        if (cursorRED !== undefined) removeSelection();
        (async () => {
            const data = await window.navigator.clipboard.readText();
            text = text.substring(0, cursor) + data + text.substring(cursor);
            cursor += data.length;
        })();
    } else {
        // normal key press
        if (cursorRED !== undefined) removeSelection();
        text = text.substring(0, cursor) + e.key + text.substring(cursor);
        cursor += 1;
    }

    saveToLocalStorage();
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
    loadFromLocalStorage();
    loadDefaults();
    updateHTMLInputs();
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
    lines.forEach((line) =>
        paintLine(
            ctx,
            line,
            page,
            cursorRED || cursorShowing ? cursor : undefined, // blinking
            cursorRED,
        ),
    );

    requestAnimationFrame(paint);
}

main();
