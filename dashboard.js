// Logic specifically for dashboard.html

let currentSession = null;
let usersDb = JSON.parse(localStorage.getItem('mj_users')) || {};

window.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const sessionStr = localStorage.getItem("mj_session");
    if (!sessionStr) {
        window.location.href = "login.html";
        return;
    }

    currentSession = JSON.parse(sessionStr);

    // Sync missing data from usersDb (in case of updates)
    if (currentSession.phone && usersDb[currentSession.phone]) {
        currentSession = { ...currentSession, ...usersDb[currentSession.phone] };
        localStorage.setItem("mj_session", JSON.stringify(currentSession));
    }

    populateProfileData();

    // Init Language Switcher active state matching logic from app.js
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z\-]+)/);
    const lang = (match && match[1]) ? match[1] : 'en';
    document.querySelectorAll('.lang-tab-btn').forEach(opt => {
        opt.classList.remove('active');
        if (opt.classList.contains(`lang-opt-${lang}`)) {
            opt.classList.add('active');
        }
    });
});

function switchTab(tabId, btnElement) {
    // Hide all views
    document.querySelectorAll('.dash-view').forEach(view => {
        view.classList.remove('active');
    });
    // Remove active class from all buttons
    document.querySelectorAll('.dash-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show target view
    document.getElementById(tabId).classList.add('active');
    // Set active button
    btnElement.classList.add('active');

    // Close sidebar on mobile after clicking item
    if (window.innerWidth <= 900) {
        toggleSidebar();
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function showToastMsg(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function populateProfileData() {
    if (!currentSession) return;

    // Fast top display
    document.getElementById('display-name-main').innerText = currentSession.name || "Student Name";
    document.getElementById('display-phone-main').innerText = currentSession.phone || "--";
    document.getElementById('display-grade-main').innerText = currentSession.grade || "--";

    // Form inputs
    document.getElementById('prof-name').value = currentSession.name || "";
    document.getElementById('prof-phone').value = currentSession.phone || "";
    document.getElementById('prof-gender').value = currentSession.gender || "";
    document.getElementById('prof-grade').value = currentSession.grade || "10";
    document.getElementById('prof-school').value = currentSession.school || "";
    document.getElementById('prof-institute').value = currentSession.institute || "";
    document.getElementById('prof-address').value = currentSession.address || "";

    // Load saved photo
    const savedPhoto = localStorage.getItem('mj_photo_' + currentSession.phone);
    if (savedPhoto) {
        document.getElementById('db-photo').src = savedPhoto;
    }
}

function saveProfileData() {
    if (!currentSession) return;

    const phone = currentSession.phone;

    // Update memory
    currentSession.name = document.getElementById('prof-name').value.trim();
    currentSession.gender = document.getElementById('prof-gender').value;
    currentSession.grade = document.getElementById('prof-grade').value;
    currentSession.school = document.getElementById('prof-school').value.trim();
    currentSession.institute = document.getElementById('prof-institute').value;
    currentSession.address = document.getElementById('prof-address').value.trim();

    // Save to users DB explicitly
    if (usersDb[phone]) {
        usersDb[phone] = { ...usersDb[phone], ...currentSession };
        localStorage.setItem('mj_users', JSON.stringify(usersDb));
        showToastMsg("Profile Updated Successfully!");
    }
}

function updateProfilePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        document.getElementById('db-photo').src = base64;
        if (currentSession) {
            localStorage.setItem('mj_photo_' + currentSession.phone, base64);
            showToastMsg("Photo Updated!");
        }
    };
    reader.readAsDataURL(file);
}

function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("mj_session");
        window.location.href = "index.html";
    }
}

// Same Language Switcher logic inside Dashboard for consistency
function changeLangDash(lang) {
    const domain = window.location.hostname;

    var gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
        gtSelect.value = lang;
        gtSelect.dispatchEvent(new Event('change'));
    }

    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (domain) {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + domain;
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + domain;
    }

    if (lang !== 'en') {
        document.cookie = `googtrans=/en/${lang}; path=/;`;
        if (domain) {
            document.cookie = `googtrans=/en/${lang}; path=/; domain=${domain}`;
            document.cookie = `googtrans=/en/${lang}; path=/; domain=.${domain}`;
        }
    }

    document.querySelectorAll('.lang-tab-btn').forEach(opt => {
        opt.classList.remove('active');
        if (opt.classList.contains(`lang-opt-${lang}`)) {
            opt.classList.add('active');
        }
    });
}

// ---------------- EXAM PORTAL LOGIC ----------------

let selectedGrade = null;
let selectedTerm = null;
let examTimerInterval = null;
let timeLeft = 40 * 60; // 40 minutes

// Mock Database of 20 Sample Questions
const sampleQuestions = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    question: `Sample ICT Question ${i + 1}: What is the correct protocol for transferring web pages?`,
    options: [
        `FTP`,
        `HTTP/HTTPS`,
        `SMTP`,
        `DHCP`
    ],
    correctIndex: 1
}));

let userAnswers = {};

function selectExamGrade(grade, btn) {
    selectedGrade = grade;
    document.querySelectorAll('#grade-options .option-card').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');

    // Reveal second step
    document.getElementById('term-section').style.display = 'block';

    // Reset term
    selectedTerm = null;
    document.querySelectorAll('#term-options .option-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('start-exam-section').style.display = 'none';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function selectExamTerm(term, btn) {
    selectedTerm = term;
    document.querySelectorAll('#term-options .option-card').forEach(c => c.classList.remove('selected'));
    btn.classList.add('selected');

    // Reveal start step
    document.getElementById('start-exam-section').style.display = 'block';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function startExam() {
    if (!selectedGrade || !selectedTerm) return;

    userAnswers = {};
    timeLeft = 40 * 60; // reset to 40mins

    // UI Transitions
    document.getElementById('exam-setup-stage').style.display = 'none';
    document.getElementById('exam-result-stage').style.display = 'none';
    document.getElementById('exam-active-stage').style.display = 'block';

    document.getElementById('active-exam-title').innerText = `Grade ${selectedGrade} - ${selectedTerm} Exam`;

    renderQuestions();
    startTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuestions() {
    const list = document.getElementById('question-list');
    list.innerHTML = "";

    sampleQuestions.forEach((q, qIndex) => {
        let optsHtml = "";
        q.options.forEach((optText, optIndex) => {
            optsHtml += `
                <label class="ans-option" onclick="handleOptionSelect(this, ${q.id})">
                    <input type="radio" name="q_${q.id}" value="${optIndex}">
                    ${optText}
                </label>
            `;
        });

        const qBox = document.createElement("div");
        qBox.className = "question-box";
        qBox.innerHTML = `
            <h4>${qIndex + 1}. ${q.question}</h4>
            <div class="options-container">
                ${optsHtml}
            </div>
        `;
        list.appendChild(qBox);
    });
}

window.handleOptionSelect = function (labelEl, questionId) {
    const container = labelEl.parentElement;
    container.querySelectorAll('.ans-option').forEach(el => el.classList.remove('selected'));
    labelEl.classList.add('selected');

    const radio = labelEl.querySelector('input[type="radio"]');
    radio.checked = true;
    userAnswers[questionId] = parseInt(radio.value);
};

function startTimer() {
    updateTimerText();
    clearInterval(examTimerInterval);
    examTimerInterval = setInterval(() => {
        timeLeft--;
        updateTimerText();

        if (timeLeft <= 0) {
            clearInterval(examTimerInterval);
            showToastMsg("Time is up! Auto-submitting exam...");
            setTimeout(submitExam, 1500);
        }
    }, 1000);
}

function updateTimerText() {
    const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const sec = (timeLeft % 60).toString().padStart(2, '0');
    const timerEl = document.getElementById('exam-timer');
    const timerText = document.getElementById('timer-text');

    timerText.innerText = `${min}:${sec}`;

    if (timeLeft < 300) { // last 5 minutes
        timerEl.style.background = "rgba(255, 0, 0, 0.3)";
        timerEl.style.color = "white";
    } else {
        timerEl.style.background = "rgba(255, 0, 0, 0.1)";
        timerEl.style.color = "var(--accent-red)";
    }
}

function submitExam() {
    clearInterval(examTimerInterval);

    let correctCount = 0;
    let wrongCount = 0;
    const total = sampleQuestions.length;
    let reviewHtml = "";

    sampleQuestions.forEach((q, index) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer === q.correctIndex;
        const isSkipped = userAnswer === undefined;

        if (isCorrect) correctCount++;
        else wrongCount++;

        const userPickedText = isSkipped ? "<i class='fas fa-exclamation-circle'></i> Not Answered" : q.options[userAnswer];
        const correctText = q.options[q.correctIndex];

        const cardClass = isCorrect ? "correct" : "wrong";
        const icon = isCorrect ? '<i class="fas fa-check" style="color:var(--accent-green)"></i>' : '<i class="fas fa-times" style="color:var(--accent-red)"></i>';

        reviewHtml += `
            <div class="review-card ${cardClass}">
                <p style="margin:0 0 10px 0; font-weight:bold; font-size:16px;">${index + 1}. ${q.question} ${icon}</p>
                <p style="margin:5px 0; font-size:14px; color:var(--text-muted);"><strong>Your Answer:</strong> <span style="color:white;">${userPickedText}</span></p>
                ${!isCorrect ? `<p style="margin:5px 0; font-size:14px; color:var(--accent-green);"><strong>Correct Answer:</strong> ${correctText}</p>` : ""}
            </div>
        `;
    });

    const percentage = Math.round((correctCount / total) * 100) || 0;

    // Populate Result Panel
    const pctEl = document.getElementById('score-percentage');
    pctEl.innerText = `${percentage}%`;
    pctEl.style.color = percentage >= 50 ? '#00e676' : '#ff3d00'; // Fallback to explicit hex
    document.getElementById('score-correct').innerText = correctCount;
    document.getElementById('score-wrong').innerText = wrongCount;
    document.getElementById('review-list').innerHTML = reviewHtml;

    // View switch
    document.getElementById('exam-active-stage').style.display = 'none';
    document.getElementById('exam-result-stage').style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetExamUI() {
    document.getElementById('exam-result-stage').style.display = 'none';
    document.getElementById('exam-setup-stage').style.display = 'block';

    selectedGrade = null;
    selectedTerm = null;
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('term-section').style.display = 'none';
    document.getElementById('start-exam-section').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
