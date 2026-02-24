const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var text = "";
var isFocused = false;
var cursor = text.length;
var lastAdded = 0;

canvas.addEventListener("focus", () => {
    isFocused = true;
    lastAdded = Date.now();
});
canvas.addEventListener("blur", () => { isFocused = false; });
canvas.addEventListener("keydown", (e) => {
    lastAdded = Date.now();

    if (e.key === "Backspace") {
        if (cursor == 0) return;
        text = text.substring(0, cursor - 1) + text.substring(cursor);
        cursor -= 1;
    } else if (e.key === "Enter") {
        text = text.substring(0, cursor) + "\n" + text.substring(cursor);
        cursor += 1;
    } else if (e.key === "Shift") { /* no-op */ }
    else if (e.key === "Meta") { /* no-op */ }
    else if (e.key === "ArrowLeft") {
        if (cursor == 0) return;
        cursor -= 1;
    } else if (e.key === "ArrowRight") { cursor += 1; }
    else if (e.key === "ArrowUp") { /* no-op */ } 
    else if (e.key === "ArrowDown") { /* no-op */ } 
    else { // normal key press
        text = text.substring(0, cursor) + e.key + text.substring(cursor);
        cursor += 1;
    }
});

function paint() {
    canvas.width = 850/2;
    canvas.height = 1100/2;

    // clear previous contents
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();

    // get cursor state
    const interval = 500;
    const blink = Math.round((Date.now() - lastAdded) / interval) % 2 == 1;
    const recentAdd = Date.now() - lastAdded < interval * 1.5;
    const cursorShowing = recentAdd || blink;

    // draw text
    ctx.font = "50px Arial";
    const lines = text.split("\n");
    var runningLetterCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const lineHeight = 60 + (i * 50);
        ctx.fillStyle = "black"; 
        ctx.fillText(lines[i], 10, lineHeight);
        
        // draw cursor
        const relativeCursor = cursor - runningLetterCount;
        if (cursorShowing && isFocused && 0 <= relativeCursor &&
            relativeCursor <= lines[i].length) {

            const cursorText = text.substring(runningLetterCount, cursor);
            const metrics = ctx.measureText(cursorText);

            ctx.beginPath();
            ctx.rect(metrics.width + 10, lineHeight + metrics.fontBoundingBoxDescent, 5, -metrics.fontBoundingBoxDescent - metrics.fontBoundingBoxAscent);
            ctx.fillStyle = "black";
            ctx.fill();
        }

        runningLetterCount += lines[i].length + 1;
    }

    requestAnimationFrame(paint);
}

requestAnimationFrame(paint);
