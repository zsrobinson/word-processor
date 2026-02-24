const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var text = "hello world!";
var isFocused = false;
var cursor = text.length;

canvas.addEventListener("focus", () => { isFocused = true; });
canvas.addEventListener("blur", () => { isFocused = false; });
canvas.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") { text = text.slice(0, -1); cursor -= 1; }
    else if (e.key === "Enter") { text += "\n"; cursor += 1; }
    else if (e.key === "Shift") { /* no-op */ }
    else if (e.key === "Meta") { /* no-op */ }
    else { text += e.key; cursor += 1;} });

function paint() {
    canvas.width = 850/2;
    canvas.height = 1100/2;

    // clear previous contents
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();

    // draw text
    ctx.font = "50px Arial";
    const lines = text.split("\n");
    var runningLetterCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const lineHeight = 60 + (i * 50);
        ctx.fillStyle = "black"; 
        ctx.fillText(lines[i], 10, lineHeight);
        
        // draw cursor
        if (cursor <= runningLetterCount + lines[i].length) {
            const beforeCursor = cursor - runningLetterCount;
            const textBeforeCursor = lines[i].split(0, beforeCursor);
            const metrics = ctx.measureText(textBeforeCursor);

            ctx.beginPath();
            ctx.arc(metrics.width + 10, lineHeight, 2, 0, 2 * Math.PI);
            ctx.fillStyle = "blue";
            ctx.fill();
        }

        runningLetterCount += lines[i].length + 1;
    }

    // focus indicator
    if (isFocused) {
        ctx.beginPath();
        ctx.arc(5, 5, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
    }

    requestAnimationFrame(paint);
}

requestAnimationFrame(paint);
