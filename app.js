// Global State
let currentUser = null;
let currentGrade = null;
let currentTerm = null;
let timerInterval = null;

// Mock Quiz Data Structure
const exams = {
    // Structure: [grade]_[term]
    "10_1": [
        { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Markup Language"], ans: 0 },
        { q: "Which symbol is used for ID in CSS?", options: [".", "#", "*"], ans: 1 },
        { q: "What is the primary use of JavaScript?", options: ["Styling", "Structure", "Interactivity"], ans: 2 }
    ]
};

// Check Login Status & Generate DOM on Load
document.addEventListener("DOMContentLoaded", () => {
    // Populate Gallery Placeholders

    const galleryGrid = document.getElementById("gallery-grid");

    // මෙතැනට ඔබේ images වල නම් ටික දාන්න 
    const myPhotos = [
        "img/01.JPG",
        "img/02.JPG",
        "img/03.JPG",
        "img/04.JPG",
        "img/05.JPG",
        "img/06.JPG",
        "img/07.JPG",
        "img/08.JPG",
        "img/09.JPG",

    ];

    myPhotos.forEach((imgUrl) => {
        if (galleryGrid) {
            const div = document.createElement('div');
            div.className = 'gallery-item';

            div.style.backgroundImage = `url('${imgUrl}')`;
            div.onclick = () => openLightbox(imgUrl);

            galleryGrid.appendChild(div);
        }
    });


    // Setting up Gallery Scroll Animations
    setupScrollAnimations();

    // Check LocalStorage Session
    const session = localStorage.getItem("mj_session");
    if (session) {
        currentUser = JSON.parse(session);
        updateNavState();
        if (currentUser.email === 'admin@mjict.com') {
            window.location.href = 'admin.html';
        } else {
            // New dedicated dashboard link
            window.location.href = 'dashboard.html';
        }
    } else {
        navigate('public-view');
    }

    // Set initial active nav link
    const firstNavLink = document.querySelector('#nav-links li a[onclick*="scrollToSection"]');
    if (firstNavLink) firstNavLink.classList.add('active');

    // Initialize Default Admin if not exists
    let users = JSON.parse(localStorage.getItem("mj_users")) || {};
    if (!users['admin@mjict.com']) {
        users['admin@mjict.com'] = { name: "Admin", pass: "admin123", approved: true };
        localStorage.setItem("mj_users", JSON.stringify(users));
    }

    // Initialize Google Auth
    initGoogleAuth();
});

// ─── Google Auth Integration ──────────────────────────
// Google Auth logic moved to login-logic.js

// ─── Testing / Demo Logic ────────────────────────────
// Demo logic moved to login-logic.js

// Scroll Event for Sticky Highlight Header
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // UPDATE ACTIVE NAV LINK
    const navLinks = document.querySelectorAll('#nav-links li a[onclick*="scrollToSection"]');
    const sections = document.querySelectorAll('section.scroll-section');
    
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(a => {
        a.classList.remove('active');
        const onclickAttr = a.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${current}'`)) {
            a.classList.add('active');
        }
    });
});

// Lightbox Logic
function openLightbox(url) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = url;
    lightbox.classList.add('active');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
}

// Navigation Logic
function navigate(pageId) {
    const header = document.getElementById('header');
    const floatWa = document.querySelector('.float-wa');

    if ((pageId === 'panel' || pageId === 'admin') && !currentUser) {
        pageId = 'login';
    }

    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    // Hide header and floating WA for dashboard/admin
    if (pageId === 'panel' || pageId === 'admin') {
        if (header) header.style.display = 'none';
        if (floatWa) floatWa.style.display = 'none';
    } else {
        if (header) header.style.display = 'flex';
        if (floatWa) floatWa.style.display = 'flex';
    }

    document.querySelector('nav').classList.remove('show');

    window.scrollTo(0, 0);
}

function scrollToSection(sectionId) {
    if (!document.getElementById('public-view').classList.contains('active')) {
        navigate('public-view');
    }
    const target = document.getElementById(sectionId);
    if (target) {
        setTimeout(() => {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }, 10);
    }

    // MANUALLY UPDATE ACTIVE CLASS ON CLICK (Immediate feedback)
    const navLinks = document.querySelectorAll('#nav-links li a[onclick*="scrollToSection"]');
    navLinks.forEach(a => {
        a.classList.remove('active');
        const onclickAttr = a.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${sectionId}'`)) {
            a.classList.add('active');
        }
    });

    document.querySelector('nav').classList.remove('show');
}

function updateNavState() {
    const loginBtn = document.getElementById("nav-login-btn");
    if (currentUser) {
        const dest = currentUser.email === 'admin@mjict.com' ? 'admin.html' : 'dashboard.html';
        loginBtn.innerHTML = `<a href="${dest}" class="btn-primary">Dashboard</a>`;
    } else {
        loginBtn.innerHTML = `<a href="login.html" class="btn-primary">Login</a>`;
    }
}

// Mobile Menu Toggle
function toggleMenu() {
    document.querySelector('nav').classList.toggle('show');
}

// Slider Logic
let currentSlide = 0;
let slideDirection = 1;

function moveSlide(dir) {
    const slider = document.getElementById("slider");
    if (!slider) return;
    const slidesCount = slider.children.length;

    if (dir !== undefined && typeof dir === 'number') {
        currentSlide += dir;
        if (currentSlide < 0) currentSlide = slidesCount - 1;
        if (currentSlide >= slidesCount) currentSlide = 0;
    } else {
        currentSlide += slideDirection;
        if (currentSlide >= slidesCount - 1) {
            currentSlide = slidesCount - 1;
            slideDirection = -1;
        } else if (currentSlide <= 0) {
            currentSlide = 0;
            slideDirection = 1;
        }
    }

    slider.style.transform = `translateX(-${currentSlide * 100}vw)`;
}

// Auto slider
setInterval(() => {
    if (document.getElementById("public-view").classList.contains("active")) {
        moveSlide();
    }
}, 5000);

// Scroll Animation Observer (IntersectionObserver)
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show');
            }
        });
    }, { threshold: 0.15 });

    const items = document.querySelectorAll('.animate-on-scroll');
    items.forEach(item => observer.observe(item));
}

// Auth State Toggle (Login/Register)
// Manual auth logic moved to login-logic.js

function showAchievers(year) {
    document.querySelectorAll('.achievers-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.year-tab').forEach(el => el.classList.remove('active'));

    const target = document.getElementById(`achievers-${year}`);
    if (target) target.classList.add('active');

    const buttons = document.querySelectorAll('.year-tab');
    buttons.forEach(btn => {
        if (btn.innerText.includes(year.toString())) {
            btn.classList.add('active');
        }
    });
}

function loginUser(email, userData) {
    currentUser = { email, ...userData };
    localStorage.setItem("mj_session", JSON.stringify(currentUser));
    updateNavState();

    // Check if admin
    if (email === 'admin@mjict.com') {
        window.location.href = 'admin.html';
    } else {
        navigate('panel');
        renderStudentProfile();
    }
    document.getElementById("auth-form").reset();
}

function logout() {
    currentUser = null;
    localStorage.removeItem("mj_session");
    updateNavState();
    navigate('public-view');
}

// ─── Student Profile ────────────────────────────────
function renderStudentProfile() {
    if (!currentUser) return;
    document.getElementById('profile-name').innerText = currentUser.name || 'Student';
    document.getElementById('profile-email').innerText = currentUser.email || '--';
    document.getElementById('profile-gender').innerText = currentUser.gender || '--';
    document.getElementById('profile-grade').innerText = currentUser.grade ? 'Grade ' + currentUser.grade : '--';
    document.getElementById('profile-grade-badge').innerText = currentUser.grade ? 'Grade ' + currentUser.grade : '--';

    // Load saved photo
    const savedPhoto = localStorage.getItem('mj_photo_' + currentUser.email);
    if (savedPhoto) {
        document.getElementById('profile-photo').src = savedPhoto;
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;
        document.getElementById('profile-photo').src = dataUrl;
        if (currentUser) {
            localStorage.setItem('mj_photo_' + currentUser.email, dataUrl);
        }
    };
    reader.readAsDataURL(file);
}

function showDashTab(tabId) {
    document.querySelectorAll('.dash-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dash-tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// ─── Admin Panel ─────────────────────────────────────
function renderAdminTable() {
    const users = JSON.parse(localStorage.getItem('mj_users')) || {};
    const tbody = document.getElementById('admin-table-body');
    const statsEl = document.getElementById('admin-stats');
    if (!tbody) return;

    const keys = Object.keys(users);
    statsEl.innerHTML = `<div class="admin-stat-card"><i class="fas fa-users"></i><span>${keys.length}</span><p>Students</p></div>`;

    tbody.innerHTML = '';
    if (keys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No students registered yet.</td></tr>';
        return;
    }
    keys.forEach((email, i) => {
        const u = users[email];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${u.name || '--'}</td>
            <td>${email}</td>
            <td>${u.grade || '--'}</td>
            <td>${u.gender || '--'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Student Dashboard Logic
function showPanel(viewId) {
    document.querySelectorAll('.panel-view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// Exam Flow Refinement
function selectGradeInline(grade, btnElement) {
    currentGrade = grade;
    
    // Highlight selected button
    const gradeCards = document.querySelectorAll('#grade-grid-container .grade-card');
    if (gradeCards) gradeCards.forEach(btn => btn.style.background = '#1c1d2e');
    if (btnElement) btnElement.style.background = 'var(--primary-blue)';
    
    // Show term section
    const termContainer = document.getElementById('term-section-container');
    if (termContainer) {
        termContainer.style.display = 'block';
        document.getElementById('display-grade-inline').innerText = grade;
        setTimeout(() => termContainer.style.opacity = '1', 10);
    }
}

function selectTermInline(term, btnElement) {
    currentTerm = term;
    
    // Highlight selected button
    const termCards = document.querySelectorAll('.term-section .term-card');
    if (termCards) termCards.forEach(btn => btn.style.background = '#1c1d2e');
    if (btnElement) btnElement.style.background = 'var(--primary-blue)';
    
    // Show start button panel
    const startContainer = document.getElementById('start-btn-container');
    if (startContainer) {
        startContainer.style.display = 'block';
        document.getElementById('start-grade-display').innerText = currentGrade;
        document.getElementById('start-term-display').innerText = currentTerm;
        setTimeout(() => startContainer.style.opacity = '1', 10);
    }
}

function exitExam() {
    if (confirm("Are you sure you want to exit? Your progress will not be saved.")) {
        clearInterval(timerInterval);
        document.getElementById('exam-portal').style.display = 'none';
        
        // Reset setup view visually
        const grades = document.querySelectorAll('#grade-grid-container .grade-card');
        if (grades) grades.forEach(b => b.style.background = '#1c1d2e');
        const terms = document.querySelectorAll('.term-section .term-card');
        if (terms) terms.forEach(b => b.style.background = '#1c1d2e');
        
        const termContainer = document.getElementById('term-section-container');
        if (termContainer) { termContainer.style.display = 'none'; termContainer.style.opacity = '0'; }
        
        const startContainer = document.getElementById('start-btn-container');
        if (startContainer) { startContainer.style.display = 'none'; startContainer.style.opacity = '0'; }
        
        showPanel('exam-setup');
    }
}

function beginExamSession() {
    startExam();
}

// Exam System
let examQuestions = [];

function startExam() {
    // Show fullscreen portal overlay
    const portal = document.getElementById('exam-portal');
    if (portal) portal.style.display = 'flex';

    // Generate 20 Sample Questions for demo purposes
    const generatedSampleQuestions = [];
    for (let i = 1; i <= 20; i++) {
        let optCount = 4;
        let options = [];
        for (let j = 0; j < optCount; j++) {
            options.push(`Choice ${String.fromCharCode(65 + j)} for Question ${i}`);
        }
        generatedSampleQuestions.push({
            q: `This is a sample question ${i} for Grade ${currentGrade} Term ${currentTerm}. Please select the correct answer from the choices below.`,
            options: options,
            ans: Math.floor(Math.random() * optCount) // Random correct answer for demo
        });
    }

    const key = `${currentGrade}_${currentTerm}`;
    examQuestions = exams[key] || generatedSampleQuestions;

    currentQuestionIndex = 0;
    renderQuestions();
    startTimer(40 * 60); // 40 minutes in seconds
}

function renderQuestions() {
    const container = document.getElementById("questions-container");
    const navGrid = document.getElementById("question-nav-grid");
    container.innerHTML = "";
    navGrid.innerHTML = "";

    examQuestions.forEach((q, index) => {
        // Build question DOM
        const box = document.createElement("div");
        box.className = "question-box" + (index === 0 ? " active" : "");
        box.id = `qbox-${index}`;

        let optionsHtml = "";
        q.options.forEach((opt, optIndex) => {
            optionsHtml += `
                <label class="option-label" onclick="markAnswered(${index})">
                    <input type="radio" name="q${index}" value="${optIndex}" required>
                    ${opt}
                </label>
            `;
        });

        box.innerHTML = `
            <h4 style="font-size:1.1rem; color: var(--text-muted); margin-bottom:10px;">Question ${index + 1} of ${examQuestions.length}</h4>
            <p style="font-size:1.3rem; margin-bottom:25px; font-weight:600;">${q.q}</p>
            <div class="options-list">
                ${optionsHtml}
            </div>
        `;
        container.appendChild(box);

        // Build Nav Grid DOM
        const navBtn = document.createElement("button");
        navBtn.type = "button";
        navBtn.className = "nav-btn" + (index === 0 ? " active" : "");
        navBtn.id = `navbtn-${index}`;
        navBtn.innerText = index + 1;
        navBtn.onclick = () => goToQuestion(index);
        navGrid.appendChild(navBtn);
    });
    
    updateNavButtons();
}

function markAnswered(index) {
    const navBtn = document.getElementById(`navbtn-${index}`);
    if (navBtn) navBtn.classList.add("answered");
}

function changeQuestion(dir) {
    let newIndex = currentQuestionIndex + dir;
    if (newIndex >= 0 && newIndex < examQuestions.length) {
        goToQuestion(newIndex);
    }
}

function goToQuestion(index) {
    // Hide current
    document.getElementById(`qbox-${currentQuestionIndex}`).classList.remove('active');
    document.getElementById(`navbtn-${currentQuestionIndex}`).classList.remove('active');
    
    currentQuestionIndex = index;
    
    // Show new
    document.getElementById(`qbox-${currentQuestionIndex}`).classList.add('active');
    document.getElementById(`navbtn-${currentQuestionIndex}`).classList.add('active');
    
    updateNavButtons();
}

function updateNavButtons() {
    const prevBtn = document.getElementById('side-prev');
    const nextBtn = document.getElementById('side-next');
    const submitBtn = document.getElementById('btn-final-submit');
    
    if (prevBtn) prevBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'flex';
    
    if (currentQuestionIndex === examQuestions.length - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'block';
    } else {
        if (nextBtn) nextBtn.style.display = 'flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }
}

function startTimer(seconds) {
    clearInterval(timerInterval);
    const timeDisplay = document.getElementById("time-left");
    timeDisplay.classList.remove("warning");

    timerInterval = setInterval(() => {
        seconds--;

        let m = Math.floor(seconds / 60);
        let s = seconds % 60;
        timeDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        if (seconds <= 300) { // 5 minutes left warning
            timeDisplay.classList.add("warning");
        }

        if (seconds <= 0) {
            clearInterval(timerInterval);
            alert("Time is up! Submitting answers automatically.");
            document.getElementById("quiz-form").dispatchEvent(new Event('submit'));
        }
    }, 1000);
}

function submitExam(e) {
    if (e) e.preventDefault();
    clearInterval(timerInterval);

    const formData = new FormData(document.getElementById("quiz-form"));
    let correct = 0;
    let wrong = 0;

    const detailedResultsContainer = document.getElementById('detailed-results');
    if (detailedResultsContainer) detailedResultsContainer.innerHTML = '';

    examQuestions.forEach((q, index) => {
        const selected = formData.get(`q${index}`);
        const isCorrect = (selected !== null && parseInt(selected) === q.ans);
        
        if (isCorrect) {
            correct++;
        } else {
            wrong++;
        }
        
        // Build review item
        if (detailedResultsContainer) {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'answer-review-item';
            
            const selectedText = selected !== null ? q.options[parseInt(selected)] : '<i style="color:var(--text-muted);">Not Answered</i>';
            const correctText = q.options[q.ans];
            
            reviewItem.innerHTML = `
                <p style="margin-bottom: 8px; font-weight:600;"><span style="color:var(--text-muted); margin-right:5px;">Q${index + 1}.</span> ${q.q}</p>
                <div style="font-size: 0.95rem; margin-left:25px;">
                    <span class="${isCorrect ? 'text-success' : 'text-danger'}">
                        <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i> 
                        Your Answer: <span style="color: white; opacity:0.9;">${selectedText}</span>
                    </span>
                    ${!isCorrect ? `<br><span class="text-success" style="display:inline-block; margin-top:5px;"><i class="fas fa-check"></i> Correct Answer: <span style="color: white; opacity:0.9;">${correctText}</span></span>` : ''}
                </div>
            `;
            detailedResultsContainer.appendChild(reviewItem);
        }
    });

    const percent = Math.round((correct / Math.max(1, examQuestions.length)) * 100) || 0;

    // Hide fullscreen overlay if active
    const portal = document.getElementById('exam-portal');
    if (portal) portal.style.display = 'none';

    document.getElementById("correct-count").innerText = correct;
    document.getElementById("wrong-count").innerText = wrong;
    
    const finalScoreEl = document.getElementById("final-score");
    if (finalScoreEl) {
        finalScoreEl.innerText = `${percent}%`;
        finalScoreEl.style.position = "relative";
        finalScoreEl.style.zIndex = "100";
    }

    // Update conic gradient based on score safely
    const circle = document.querySelector('.score-circle');
    if (circle) {
        circle.style.background = `conic-gradient(var(--neon-blue) ${percent}%, rgba(255,255,255,0.05) ${percent}%)`;
    }

    showPanel('exam-results');
}

// Custom Language Switcher Logic
function toggleLangDropdown(containerId) {
    const container = document.getElementById(containerId || 'lang-switcher');
    if (container) {
        container.classList.toggle('active');
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    document.querySelectorAll('.lang-dropdown-container').forEach(container => {
        if (!container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
});

function changeLang(lang) {
    const domain = window.location.hostname;
    
    // 1. Trigger Google Translate Dropdown Directly (Vital for local file:/// and immediate translation)
    var gtSelect = document.querySelector('.goog-te-combo');
    if (gtSelect) {
        gtSelect.value = lang; // Setting to 'en' explicitly triggers the "Show Original" behavior
        gtSelect.dispatchEvent(new Event('change'));
    }
    
    // 2. Also set cookies for persistence if hosted on a real server
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
    
    // 3. Update the UI Text directly (no reload needed!)
    const langMap = {
        'en': { text: 'English', flag: 'https://flagcdn.com/w20/us.png' },
        'si': { text: 'Sinhala', flag: 'https://flagcdn.com/w20/lk.png' },
        'ta': { text: 'Tamil', flag: 'https://flagcdn.com/w20/lk.png' }
    };
    const selected = langMap[lang] || langMap['en'];

    const langTexts = document.querySelectorAll('.current-lang-text, #current-lang-text');
    const langFlags = document.querySelectorAll('.current-lang-flag, #current-lang-flag');
    
    langTexts.forEach(el => el.innerText = selected.text);
    langFlags.forEach(el => el.src = selected.flag);

    // Update active state in flat tabs
    document.querySelectorAll('.lang-tab-btn').forEach(opt => {
        opt.classList.remove('active');
        if (opt.classList.contains(`lang-opt-${lang}`)) {
            opt.classList.add('active');
        }
    });

    // Note: Do NOT perform location.reload() here since that clears changes on file:///
}

// Set correct dropdown value on load
window.addEventListener('DOMContentLoaded', () => {
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z\-]+)/);
    const lang = (match && match[1]) ? match[1] : 'en';
    
    const langMap = {
        'en': { text: 'English', flag: 'https://flagcdn.com/w20/us.png' },
        'si': { text: 'Sinhala', flag: 'https://flagcdn.com/w20/lk.png' },
        'ta': { text: 'Tamil', flag: 'https://flagcdn.com/w20/lk.png' }
    };
    const selected = langMap[lang] || langMap['en'];

    // Support both ID and class updates in case any are left
    const langTexts = document.querySelectorAll('.current-lang-text, #current-lang-text');
    const langFlags = document.querySelectorAll('.current-lang-flag, #current-lang-flag');
    
    langTexts.forEach(el => el.innerText = selected.text);
    langFlags.forEach(el => el.src = selected.flag);

    // Update active state in flat tabs
    document.querySelectorAll('.lang-tab-btn').forEach(opt => {
        opt.classList.remove('active');
        if (opt.classList.contains(`lang-opt-${lang}`)) {
            opt.classList.add('active');
        }
    });
});

// Feedback Slider Logic
function moveFeedback(dir) {
    const grid = document.getElementById("feedback-grid");
    if (grid) {
        const scrollAmount = 380; // card width + gap
        grid.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
}

function moveFlyers(dir) {
    const grid = document.getElementById("flyers-grid");
    if (grid) {
        const scrollAmount = 325; // card width + gap
        grid.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
}
