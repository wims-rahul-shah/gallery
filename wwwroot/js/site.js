// === Sidebar controls ===
function toggleSidebar(){
    const sb = document.getElementById("sidebar");
    const ov = document.getElementById("sidebarOverlay");
    const showing = sb.classList.toggle("show");
    ov.classList.toggle("show", showing);
    document.body.style.overflow = showing ? "hidden" : "";
}
function hideSidebar(){
    const sb = document.getElementById("sidebar");
    const ov = document.getElementById("sidebarOverlay");
    sb.classList.remove("show");
    ov.classList.remove("show");
    document.body.style.overflow = "";
}
function setActive(el) {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    el.classList.add('active');
}

// Close sidebar with ESC
document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') hideSidebar();
});

// Click outside to close is handled by overlay element via onclick in layout.

// === Global loader ===
const loader = document.getElementById('loaderOverlay');
function showLoader(){ if(loader){ loader.classList.add('show'); } }
function hideLoader(){ if(loader){ loader.classList.remove('show'); } }

// Show loader on full page unload/navigation
window.addEventListener('beforeunload', () => { showLoader(); });

// Enhance anchor links with [data-loading] to show spinner
document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[data-loading="true"]');
    if(a && a.href){
        showLoader();
    }
});

// === Keep your existing functions intact, but add loader around fetch calls ===

// Tab loader
function loadTab(tabName) {
    showLoader();
    fetch(`/Home/${tabName}`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("mainContent").innerHTML = html;

            if (tabName === "Widgets") {
                console.log("ille");
                initWidgets();
            }
            if (tabName === "Chat") {
                initChat();
            }
        })
        .catch(err => console.error(err))
        .finally(()=>{ hideLoader(); hideSidebar(); });
}

// PDF download for registered users (unchanged)
function downloadTable() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Registered Users", 14, 20);
    doc.autoTable({
        html: '#usersTable',
        startY: 30,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [33, 37, 41] },
    });
    doc.save("registered_users.pdf");
}

// PhotoLibrary folder active state (unchanged logic)
(function () {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('.folder');
    if (!link) return;
    document.querySelectorAll('.folder.active').forEach(el => el.classList.remove('active'));
    link.classList.add('active');
  }, false);
})();

// Toggle sidebar in mobile (exported so markup can call it)
function toggleSidebarPublic(){ toggleSidebar(); }

// Top search YouTube
function submitTopSearch() {
    var q = document.getElementById('topSearchInput')?.value || 'latest';
    showLoader();
    fetch(`/Home/VideoLibrary?q=${encodeURIComponent(q)}`)
        .then(r => r.text())
        .then(html => document.getElementById("mainContent").innerHTML = html)
        .catch(e => console.error(e))
        .finally(()=> hideLoader());
}

// YouTube player helpers (unchanged)
function openVideoById(vid) {
    var frame = document.getElementById('videoFrame');
    if (!vid) return;
    frame.src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0';
    var modal = new bootstrap.Modal(document.getElementById('videoModal'));
    modal.show();
    var modalEl = document.getElementById('videoModal');
    modalEl.addEventListener('hidden.bs.modal', function () { frame.src = ''; }, { once: true });
}
function openVideo(urlOrId) {
    var id = urlOrId;
    try {
        if (urlOrId.includes('youtube.com') || urlOrId.includes('youtu.be')) {
            var u = new URL(urlOrId);
            if (u.hostname.includes('youtu.be')) { id = u.pathname.substring(1); }
            else { id = u.searchParams.get('v') || id; }
        }
    } catch (e) { }
    openVideoById(id);
}
function refreshVideos() {
    showLoader();
    document.getElementById('topSearchInput').value = '';
    fetch(`/Home/VideoLibrary?q=latest`)
        .then(res => res.text())
        .then(html => { document.getElementById('mainContent').innerHTML = html; })
        .catch(err => console.error(err))
        .finally(()=> hideLoader());
}

// Music
function music(button) {
    document.getElementById("music-frame").src = button.getAttribute("data-src");
    document.querySelectorAll(".music-btn").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
}

// News
function submitNewsSearch() {
    var q = document.getElementById('newsSearchInput').value || 'India';
    showLoader();
    fetch(`/Home/News?q=${encodeURIComponent(q)}`)
        .then(r => r.text())
        .then(html => document.getElementById("mainContent").innerHTML = html)
        .catch(e => console.error(e))
        .finally(()=> hideLoader());
}
function refreshNews() {
    showLoader();
    document.getElementById('newsSearchInput').value = '';
    fetch(`/Home/News?q=latest`)
        .then(res => res.text())
        .then(html => {
            document.getElementById('mainContent').innerHTML = html;
        })
        .catch(err => console.error(err))
        .finally(()=> hideLoader());
}

// Games loader (unchanged, but adds loader + closes sidebar on mobile)
async function loadGame(game, btn) {
    const gameContainer = document.getElementById('gameContainer');
    document.querySelectorAll('.game-btn.active').forEach(el => el.classList.remove('active'));
    btn && btn.classList.add('active');
    gameContainer.innerHTML = '<p>Loading...</p>';
    showLoader();
    try {
        if (game === 'snake') {
            const res = await fetch('/Home/Snake'); const html = await res.text(); gameContainer.innerHTML = html;
            const module = await import('/js/snake.js'); module.initSnakeGame();
        } else if (game === 'tetris') {
            const res = await fetch('/Home/Tetris'); const html = await res.text(); gameContainer.innerHTML = html;
            const module = await import('/js/tetris.js'); module.initTetrisGame();
        } else if (game === 'flappybird') {
            const res = await fetch('/Home/FlappyBird'); const html = await res.text(); gameContainer.innerHTML = html;
            const module = await import('/js/flappybird.js'); module.initFlappyGame();
        } else if (game === 'quiz') {
            const res = await fetch('/Home/Quiz'); const html = await res.text(); gameContainer.innerHTML = html;
            const module = await import('/js/quiz.js'); module.initQuiz();
        }
    } catch (err) {
        console.error("Error loading game:", err);
        gameContainer.innerHTML = '<p>Failed to load game.</p>';
    } finally {
        hideLoader();
        hideSidebar();
    }
}

// Widgets: wrap loads with try/catch if present (kept as-is if defined elsewhere)

// Email send (unchanged, but loader feedback)
async function sendEmail() {
    let subject = document.getElementById("emailSubject").value;
    let body = document.getElementById("emailBody").value;
    showLoader();
    try {
        const res = await fetch("/Home/Email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, body })
        });
        const result = await res.json();
        if (result.success) {
            alert("✅ Email sent successfully!");
            document.getElementById("emailSubject").value = "";
            document.getElementById("emailBody").value = "";
        } else {
            alert("❌ Failed: " + result.error);
        }
    } catch (e) {
        alert("❌ Failed: " + e.message);
    } finally {
        hideLoader();
    }
}

//widgets function
function initWidgets() {
    // 1️⃣ Weather
    const weatherApiKey = "e7c5936af87f7c6dc44f17f1dad5085d";
    const city = "Tinsukia";

    async function loadWeather() {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
            const data = await res.json();
            document.getElementById("weatherContent").innerHTML = `
                            <p>Location - ${data.name} | ${data.sys.country}</p>
                            <p>Temp - ${Math.round(data.main.temp)}°C | Feels Like - ${Math.round(data.main.feels_like)}°C</p>
                            <p>🌬 Wind: ${data.wind.speed} Miles/hr | ${data.weather[0].description}</p>
                        `;
        } catch (e) {
            console.error(e);
            document.getElementById("weatherContent").innerText = "Failed to load weather.";
        }
    }
    loadWeather();

    // Clock
    function updateClock() {
        let now = new Date();
        document.getElementById("clockTime").innerText = now.toLocaleTimeString();
        document.getElementById("clockDate").innerText = now.toDateString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // To-do
    let todoList = JSON.parse(localStorage.getItem("todos") || "[]");
    function renderTodos() {
        document.getElementById("todoList").innerHTML = todoList.map((t, i) =>
            `<li style="display:flex; justify-content:space-between; align-items:center;
                           padding:5px; margin-bottom:4px; background:rgba(0,255,128,0.1);
                           border-radius:4px;">
                    <span>${t}</span>
                    <button class="btn btn-sm btn-danger"
                            style="margin-left:300px; padding:3px 7px; font-size:14px; line-height:1;"
                            onclick="removeTodo(${i})">x</button>
                 </li>`
        ).join("");
        localStorage.setItem("todos", JSON.stringify(todoList));
    }
    document.getElementById("newTodo").addEventListener("keypress", e => {
        if (e.key === "Enter") {
            todoList.push(e.target.value);
            e.target.value = "";
            renderTodos();
        }
    });
    window.removeTodo = i => { todoList.splice(i, 1); renderTodos(); };
    renderTodos();

    // Calculator
    window.calculate = function () {
        try {
            let expr = document.getElementById("calcInput").value;
            let result = eval(expr);
            document.getElementById("calcResult").innerText = "= " + result;
        } catch {
            document.getElementById("calcResult").innerText = "Invalid Expression";
        }
    };

    /* Stopwatch with milliseconds */
    let swInterval, swMs = 0;
    function updateStopwatch() {
        let hrs = String(Math.floor(swMs / 3600000)).padStart(2, '0');
        let mins = String(Math.floor((swMs % 3600000) / 60000)).padStart(2, '0');
        let secs = String(Math.floor((swMs % 60000) / 1000)).padStart(2, '0');
        let ms = String(swMs % 1000).padStart(3, '0');
        document.getElementById("stopwatch").innerText = `${hrs}:${mins}:${secs}.${ms}`;
    }
    window.startStopwatch = () => { if (!swInterval) swInterval = setInterval(() => { swMs += 10; updateStopwatch(); }, 10); };
    window.stopStopwatch = () => { clearInterval(swInterval); swInterval = null; };
    window.resetStopwatch = () => { swMs = 0; updateStopwatch(); };
    updateStopwatch();

    // Quote of the Day
    const quotes = [
        "🌟 Believe in yourself and all that you are.",
        "🚀 The best way to get started is to quit talking and begin doing.",
        "🌈 Difficult roads often lead to beautiful destinations.",
        "🔥 Don’t watch the clock; do what it does. Keep going.",
        "💡 Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "🌍 Small steps in the right direction can turn out to be the biggest step of your life."
    ];

    function loadQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        document.getElementById("quoteText").innerText = quotes[randomIndex];
    }
    loadQuote();
}

//js for AI Chat
function initChat() {
    const sendBtn = document.getElementById("sendBtn");
    const input = document.getElementById("chatInput");
    const chatBox = document.getElementById("chatBox");
    const typingIndicator = document.getElementById("typingIndicator");

    // Basic Markdown parser for styling
    function formatMarkdown(text) {
        return text
            .replace(/\n/g, "<br>")                         // line breaks
            .replace(/```([^`]*)```/gs, "<pre><code>$1</code></pre>") // code blocks
            .replace(/`([^`]*)`/g, "<code>$1</code>")       // inline code
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")         // bold
            .replace(/\*(.*?)\*/g, "<i>$1</i>")             // italic
            .replace(/^- (.*)$/gm, "• $1");                 // bullet list
    }

    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;

        // User message
        chatBox.innerHTML += `
                    <div class="msg-wrapper from-user">
                        <span class="avatar">🙂</span>
                        <div class="msg msg-user">${message}</div>
                    </div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        input.value = "";

        // Show typing indicator
        typingIndicator.style.display = "block";

        try {
            const resp = await fetch("/Home/PostChat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            const data = await resp.json();

            typingIndicator.style.display = "none";

            if (data.success) {
                const formattedReply = formatMarkdown(data.reply);

                chatBox.innerHTML += `
                            <div class="msg-wrapper from-bot">
                                <span class="avatar">🤖</span>
                                <div class="msg msg-bot">${formattedReply}</div>
                            </div>`;
            } else {
                chatBox.innerHTML += `
                            <div class="msg-wrapper from-bot">
                                <span class="avatar">⚠️</span>
                                <div class="msg msg-bot text-danger"><b>Error:</b> ${data.error}</div>
                            </div>`;
            }
        } catch (err) {
            typingIndicator.style.display = "none";
            chatBox.innerHTML += `
                        <div class="msg-wrapper from-bot">
                            <span class="avatar">⚠️</span>
                            <div class="msg msg-bot text-danger"><b>Request failed:</b> ${err}</div>
                        </div>`;
        }

        chatBox.scrollTop = chatBox.scrollHeight;
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });
}
