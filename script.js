const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var text = "hello world!";
var isFocused = false;

canvas.addEventListener("focus", () => { isFocused = true; });
canvas.addEventListener("blur", () => { isFocused = false; });
canvas.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") { text = text.slice(0, -1); }
    else if (e.key === "Enter") { text += "\n"; }
    else if (e.key === "Shift") { /* no-op */ }
    else if (e.key === "Meta") { /* no-op */ }
    else { text += e.key; } });

function paint() {
    canvas.width = 850/2;
    canvas.height = 1100/2;

    // clear previous contents
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fill();

    // draw text
    ctx.font = "50px Arial";
    ctx.fillStyle = "black";    
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 10, 60 + (i * 50));
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
