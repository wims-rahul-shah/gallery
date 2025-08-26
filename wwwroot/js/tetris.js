export function initTetrisGame() {
    const canvas = document.getElementById("tetrisCanvas");
    const ctx = canvas.getContext("2d");
    const rows = 25;
    const cols = 15;
    const blockWidth = canvas.width / cols;
    const blockHeight = canvas.height / rows;

    let board = Array.from({ length: rows }, () => Array(cols).fill(0));
    let currentPiece, score = 0, loopId = null, speed = 500;

    const PIECES = [
        { shape: [[1, 1, 1, 1]], color: "#0ff" },       // I
        { shape: [[1, 1], [1, 1]], color: "#f0f" },     // O
        { shape: [[0, 1, 0], [1, 1, 1]], color: "#0f0" }, // T
        { shape: [[0, 1, 1], [1, 1, 0]], color: "#ff0" }, // S
        { shape: [[1, 1, 0], [0, 1, 1]], color: "#f80" }, // Z
        { shape: [[1, 0, 0], [1, 1, 1]], color: "#08f" }, // J
        { shape: [[0, 0, 1], [1, 1, 1]], color: "#f08" }, // L
    ];

    function reset() {
        board = Array.from({ length: rows }, () => Array(cols).fill(0));
        score = 0;
        currentPiece = randomPiece();
        updateScore();
        clearInterval(loopId);
        loopId = null;
        draw();
    }

    function randomPiece() {
        const p = PIECES[Math.floor(Math.random() * PIECES.length)];
        return { x: Math.floor(cols / 2) - 1, y: 0, shape: p.shape, color: p.color };
    }

    function draw() {
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw board
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c]) {
                    ctx.fillStyle = board[r][c];
                    ctx.fillRect(c * blockWidth, r * blockHeight, blockWidth - 1, blockHeight - 1);
                }
            }
        }

        // draw current piece
        ctx.fillStyle = currentPiece.color;
        currentPiece.shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) ctx.fillRect((currentPiece.x + x) * blockWidth, (currentPiece.y + y) * blockHeight, blockWidth - 1, blockHeight - 1);
            });
        });
    }

    function updateScore() {
        document.getElementById("tetrisScore").innerText = score;
    }

    function movePiece(dx, dy) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        if (collide()) { currentPiece.x -= dx; currentPiece.y -= dy; return false; }
        draw(); return true;
    }

    function rotatePiece() {
        const old = currentPiece.shape;
        currentPiece.shape = currentPiece.shape[0].map((_, i) => currentPiece.shape.map(row => row[i]).reverse());
        if (collide()) currentPiece.shape = old;
        draw();
    }

    function collide() {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const nx = currentPiece.x + x, ny = currentPiece.y + y;
                    if (nx < 0 || nx >= cols || ny >= rows || board[ny][nx]) return true;
                }
            }
        }
        return false;
    }

    function drop() {
        if (!movePiece(0, 1)) {
            merge();
            clearLines();
            currentPiece = randomPiece();
            if (collide()) gameOver();
        }
    }

    function merge() {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
            });
        });
    }

    function clearLines() {
        let lines = 0;
        board = board.filter(row => {
            if (row.every(c => c)) { lines++; return false; }
            return true;
        });
        while (board.length < rows) board.unshift(Array(cols).fill(0));
        score += lines * 10;
        updateScore();
    }

    function gameOver() {
        clearInterval(loopId);
        loopId = null;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Game Over - Tap Restart", canvas.width / 2, canvas.height / 2);
    }

    function startGame() { if (!loopId) loopId = setInterval(drop, speed); }
    function pauseGame() { if (loopId) { clearInterval(loopId); loopId = null; } }

    // Keyboard
    window.addEventListener("keydown", e => {
        const k = e.key.toLowerCase();
        if (k === "arrowleft" || k === "a") movePiece(-1, 0);
        if (k === "arrowright" || k === "d") movePiece(1, 0);
        if (k === "arrowdown" || k === "s") drop();
        if (k === "arrowup" || k === "w") rotatePiece();
    });

    // Buttons
    document.getElementById("left").addEventListener("click", () => movePiece(-1, 0));
    document.getElementById("right").addEventListener("click", () => movePiece(1, 0));
    document.getElementById("down").addEventListener("click", drop);
    document.getElementById("rotate").addEventListener("click", rotatePiece);
    document.getElementById("startTetris").addEventListener("click", startGame);
    document.getElementById("pauseTetris").addEventListener("click", pauseGame);
    document.getElementById("restartTetris").addEventListener("click", reset);

    reset();
}
