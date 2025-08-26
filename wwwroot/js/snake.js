export function initSnakeGame() {
    const canvas = document.getElementById("snakeCanvas");
    if (!canvas) { console.error("❌ snakeCanvas not found!"); return; }
    const ctx = canvas.getContext("2d");
    const grid = 32;  // bigger squares
    const size = 20;

    let snake = [];
    let apple = {};
    let dx = 0, dy = 0;
    let loopId = null;
    let speed = 200; // slower initial speed
    let score = 0;
    let isRunning = false;

    const scoreEl = document.getElementById('snakeScore'); // fixed ID

    function reset() {
        snake = [{ x: 8, y: 10 }];
        dx = 0; dy = 0;
        apple = spawnApple();
        speed = 200;
        score = 0;
        scoreEl && (scoreEl.innerText = score);
        clearInterval(loopId);
        draw();
        isRunning = false;
    }

    function spawnApple() {
        while (true) {
            const a = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
            if (!snake.some(s => s.x === a.x && s.y === a.y)) return a;
        }
    }

    function startGame() {
        if (!isRunning) {
            dx = 1; dy = 0;
            loopId = setInterval(tick, speed);
            isRunning = true;
        }
    }

    function pauseGame() {
        clearInterval(loopId);
        isRunning = false;
    }

    function tick() {
        const head = { x: (snake[0].x + dx + size) % size, y: (snake[0].y + dy + size) % size };

        if (snake.some((s, i) => i && s.x === head.x && s.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (head.x === apple.x && head.y === apple.y) {
            apple = spawnApple();
            score++;
            scoreEl && (scoreEl.innerText = score);
            if (speed > 60) {
                clearInterval(loopId);
                speed -= 10;  // gradually increase speed
                loopId = setInterval(tick, speed);
            }
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = "#0b1220";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // apple
        ctx.fillStyle = "#e11d48";
        ctx.fillRect(apple.x * grid, apple.y * grid, grid, grid);

        // snake
        ctx.fillStyle = "#22c55e";
        snake.forEach(s => ctx.fillRect(s.x * grid, s.y * grid, grid - 2, grid - 2));
    }

    function gameOver() {
        clearInterval(loopId);
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
        isRunning = false;
    }

    const setDir = (nx, ny) => { if (nx !== -dx || ny !== -dy) { dx = nx; dy = ny; } };

    window.addEventListener("keydown", e => {
        const k = e.key.toLowerCase();
        if ((k === 'arrowup' || k === 'w') && dy !== 1) { dx = 0; dy = -1; }
        if ((k === 'arrowdown' || k === 's') && dy !== -1) { dx = 0; dy = 1; }
        if ((k === 'arrowleft' || k === 'a') && dx !== 1) { dx = -1; dy = 0; }
        if ((k === 'arrowright' || k === 'd') && dx !== -1) { dx = 1; dy = 0; }
    });

    ['up', 'down', 'left', 'right'].forEach(id => {
        document.getElementById(id)?.addEventListener('click', () => {
            if (id === 'up') setDir(0, -1);
            if (id === 'down') setDir(0, 1);
            if (id === 'left') setDir(-1, 0);
            if (id === 'right') setDir(1, 0);
        });
    });

    document.getElementById('startSnake')?.addEventListener('click', startGame);
    document.getElementById('pauseSnake')?.addEventListener('click', pauseGame);
    document.getElementById('restartSnake')?.addEventListener('click', reset);
    document.getElementById('restartSnake')?.addEventListener('touchstart', e => { e.preventDefault(); reset(); }, { passive: false });

    let sx = 0, sy = 0;
    canvas.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    canvas.addEventListener('touchend', e => {
        const t = e.changedTouches[0];
        const dxp = t.clientX - sx, dyp = t.clientY - sy;
        if (Math.abs(dxp) > Math.abs(dyp)) setDir(dxp > 0 ? 1 : -1, 0);
        else setDir(0, dyp > 0 ? 1 : -1);
    }, { passive: true });

    reset();
}
