export function initFlappyGame() {
    const canvas = document.getElementById('flappyCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let bird = { x: 50, y: height / 2, radius: 12, dy: 0 };
    const gravity = 0.6;
    const jump = -10;
    const pipes = [];
    const pipeWidth = 50;
    const pipeGap = 140;
    let frame = 0;
    let score = 0;
    let loopId = null;

    function reset() {
        bird = { x: 50, y: height / 2, radius: 12, dy: 0 };
        pipes.length = 0;
        frame = 0;
        score = 0;
        updateScore();
        if (loopId) clearInterval(loopId);
        loopId = null;
        draw();
    }

    function drawBird() {
        ctx.fillStyle = '#0ff';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPipes() {
        ctx.fillStyle = '#f0f';
        pipes.forEach(pipe => {
            ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
            ctx.fillRect(pipe.x, height - pipe.bottom, pipeWidth, pipe.bottom);
        });
    }

    function addPipe() {
        const top = Math.floor(Math.random() * (height - pipeGap - 40)) + 20;
        const bottom = height - top - pipeGap;
        pipes.push({ x: width, top, bottom });
    }

    function updateScore() {
        document.getElementById('flappyScore').innerText = score;
    }

    function draw() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);

        drawBird();
        drawPipes();
    }

    function loop() {
        frame++;
        bird.dy += gravity;
        bird.y += bird.dy;

        if (frame % 90 === 0) addPipe();

        // move pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= 2;
            // check collision
            if (bird.x + bird.radius > pipes[i].x &&
                bird.x - bird.radius < pipes[i].x + pipeWidth &&
                (bird.y - bird.radius < pipes[i].top || bird.y + bird.radius > height - pipes[i].bottom)) {
                gameOver();
            }
            // passed pipe
            if (pipes[i].x + pipeWidth === bird.x) {
                score++;
                updateScore();
            }
            // remove offscreen
            if (pipes[i].x + pipeWidth < 0) pipes.splice(i, 1);
        }

        // hit floor or ceiling
        if (bird.y + bird.radius > height || bird.y - bird.radius < 0) gameOver();

        draw();
    }

    function startGame() {
        if (!loopId) loopId = setInterval(loop, 20);
    }

    function pauseGame() {
        if (loopId) {
            clearInterval(loopId);
            loopId = null;
        }
    }

    function jumpBird() {
        bird.dy = jump;
    }

    function gameOver() {
        pauseGame();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.font = '20px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over - Tap Restart', width / 2, height / 2);
    }

    // Controls
    window.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'ArrowUp') jumpBird();
    });

    canvas.addEventListener('click', jumpBird);

    document.getElementById('startFlappy').addEventListener('click', startGame);
    document.getElementById('pauseFlappy').addEventListener('click', pauseGame);
    document.getElementById('restartFlappy').addEventListener('click', reset);

    reset();
}
