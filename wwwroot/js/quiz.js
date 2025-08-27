export function initQuiz() {
    let quizData = [];
    let currentQuestionIndex = 0;
    let score = 0;

        const startBtn = document.getElementById("startQuiz");
        const restartBtn = document.getElementById("restartQuiz");

        if (startBtn) {
            startBtn.addEventListener("click", () => {
                loadQuiz();
            });
        }

        if (restartBtn) {
            restartBtn.addEventListener("click", () => {
                loadQuiz();
            });
        }

    async function loadQuiz() {
        const container = document.getElementById("quizContainer");
        const scoreEl = document.getElementById("quizScore");

        container.innerHTML = `<p class="loading">Loading quiz questions...</p>`;

        try {
            const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
            const data = await res.json();

            quizData = data.results.map(q => {
                let answers = [...q.incorrect_answers];
                let randomIndex = Math.floor(Math.random() * (answers.length + 1));
                answers.splice(randomIndex, 0, q.correct_answer);

                return {
                    question: decodeHtml(q.question),
                    answers: answers.map(a => decodeHtml(a)),
                    correct: decodeHtml(q.correct_answer)
                };
            });

            currentQuestionIndex = 0;
            score = 0;
            if (scoreEl) scoreEl.innerText = score;

            showQuestion();
        } catch (err) {
            container.innerHTML = `<p class="text-danger">❌ Error loading quiz. Try again later.</p>`;
        }
    }

    function showQuestion() {
        const container = document.getElementById("quizContainer");
        const scoreEl = document.getElementById("quizScore");

        if (currentQuestionIndex >= quizData.length) {
            container.innerHTML = `
                <h3>🎉 Quiz Completed!</h3>
                <p>Your final score: <strong>${score}/${quizData.length}</strong></p>
            `;
            return;
        }

        let q = quizData[currentQuestionIndex];
        let optionsHtml = q.answers
            .map(ans => `<div class="quiz-option btn btn-outline-primary w-100 mb-2" data-answer="${ans}">${ans}</div>`)
            .join("");

        container.innerHTML = `
            <div class="quiz-question mb-3">${q.question}</div>
            <div class="quiz-options">${optionsHtml}</div>
            <button class="btn btn-secondary mt-3" id="nextQuestion" disabled>Next Question</button>
        `;

        if (scoreEl) scoreEl.innerText = score;

        container.querySelectorAll(".quiz-option").forEach(opt => {
            opt.addEventListener("click", () => checkAnswer(opt, q.correct));
        });

        const nextBtn = document.getElementById("nextQuestion");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                currentQuestionIndex++;
                showQuestion();
            });
        }
    }

    function checkAnswer(element, correctAnswer) {
        let options = document.querySelectorAll(".quiz-option");
        options.forEach(opt => opt.style.pointerEvents = "none");

        if (element.dataset.answer === correctAnswer) {
            element.classList.replace("btn-outline-primary", "btn-success");
            element.insertAdjacentHTML("beforeend", " ✅ Correct");
            score++;
            document.getElementById("quizScore").innerText = score;
        } else {
            element.classList.replace("btn-outline-primary", "btn-danger");
            element.insertAdjacentHTML("beforeend", " ❌ Incorrect");

            options.forEach(opt => {
                if (opt.dataset.answer === correctAnswer) {
                    opt.classList.replace("btn-outline-primary", "btn-success");
                    opt.insertAdjacentHTML("beforeend", " ✅ Correct");
                }
            });
        }

        const nextBtn = document.getElementById("nextQuestion");
        if (nextBtn) nextBtn.disabled = false;
    }

    function decodeHtml(html) {
        let txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }
}
