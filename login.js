// Default Users database
let usersDb = JSON.parse(localStorage.getItem('mj_users')) || {};
let currentPhone = "";
let expectedOTP = "1234";
let isExistingUser = false;

// Auto-redirect if already logged in
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("mj_session")) {
        window.location.href = "dashboard.html";
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function sendOTP() {
    const phoneInput = document.getElementById('phone-input').value.trim();
    if (phoneInput.length < 9) {
        alert("Please enter a valid phone number (e.g. 712345678)");
        return;
    }
    
    // Normalize phone number to start with 0
    currentPhone = "0" + (phoneInput.startsWith("0") ? phoneInput.substring(1) : phoneInput);
    document.getElementById('display-phone').innerText = currentPhone;
    
    // Check if user exists
    isExistingUser = !!usersDb[currentPhone];
    
    if (isExistingUser) {
        // User exists -> Skip OTP and go directly to Password Login
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-3').classList.add('active');
        document.getElementById('step-desc').innerText = `Welcome back, ${usersDb[currentPhone].name}!`;
        // Hide registration specific fields
        document.getElementById('registration-fields').style.display = 'none';
        document.getElementById('pwd-label').innerText = "Enter your password to sign in";
        document.getElementById('final-btn').innerText = "Login to Dashboard";
        setTimeout(() => document.getElementById('reg-password').focus(), 100);
        return;  // End function here to prevent sending OTP
    }
    
    // New User -> Generate Random OTP (for demo, we will show it in a toast)
    expectedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    showToast(`[System Message] Your Demo OTP is: ${expectedOTP}`);

    // UI Transition to OTP screen
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.add('active');
    document.getElementById('step-desc').innerText = "OTP Verification";
    
    // Focus first OTP input
    setTimeout(() => {
        document.querySelector('.otp-input').focus();
    }, 100);
}

function resendOTP() {
    expectedOTP = Math.floor(1000 + Math.random() * 9000).toString();
    showToast(`[System Message] Your New Demo OTP is: ${expectedOTP}`);
    
    // Clear inputs
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');
    document.querySelector('.otp-input').focus();
}

function moveToNext(element, event) {
    if (event.key === "Backspace") {
        const prev = element.previousElementSibling;
        if (prev) {
            prev.focus();
            prev.value = '';
        }
        return;
    }
    // Allow only numbers
    element.value = element.value.replace(/[^0-9]/g, '');
    
    if (element.value.length === 1) {
        const next = element.nextElementSibling;
        if (next) {
            next.focus();
        } else {
            // Auto submit if last digit entered
            verifyOTP();
        }
    }
}

function verifyOTP() {
    const inputs = document.querySelectorAll('.otp-input');
    let enteredOTP = "";
    inputs.forEach(input => enteredOTP += input.value);

    if (enteredOTP.length < 4) return;

    if (enteredOTP === expectedOTP) {
        showToast("OTP Verified successfully!");
        
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-3').classList.add('active');
        
        if (isExistingUser) {
            document.getElementById('step-desc').innerText = `Welcome back, ${usersDb[currentPhone].name}!`;
            document.getElementById('registration-fields').style.display = 'none';
            document.getElementById('pwd-label').innerText = "Enter your password to sign in";
            document.getElementById('final-btn').innerText = "Login to Dashboard";
            setTimeout(() => document.getElementById('reg-password').focus(), 100);
        } else {
            document.getElementById('step-desc').innerText = "Complete your registration";
            document.getElementById('registration-fields').style.display = 'block';
            document.getElementById('pwd-label').innerText = "Create a secure password";
            document.getElementById('final-btn').innerText = "Register Account";
        }
    } else {
        alert("Invalid OTP! Please check the notification and try again.");
        document.querySelectorAll('.otp-input').forEach(input => input.value = '');
        document.querySelector('.otp-input').focus();
    }
}

function togglePassword(icon) {
    const pwdInput = document.getElementById('reg-password');
    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function completeAuth() {
    const password = document.getElementById('reg-password').value;
    
    if (password.length < 3) {
        alert("Password is too short.");
        return;
    }

    if (isExistingUser) {
        // Login Flow
        if (usersDb[currentPhone].pass === password) {
            loginSession(currentPhone, usersDb[currentPhone]);
        } else {
            alert("Incorrect password! Try again.");
        }
    } else {
        // Registration Flow
        const name = document.getElementById('reg-name').value.trim();
        const grade = document.getElementById('reg-grade').value;
        
        if (!name || !grade) {
            alert("Please provide your name and grade to register.");
            return;
        }

        const newUser = {
            name: name,
            grade: grade,
            pass: password,
            email: currentPhone + "@student.mjict.com", 
            phone: currentPhone,
            role: "student",
            approved: true
        };
        
        usersDb[currentPhone] = newUser;
        localStorage.setItem('mj_users', JSON.stringify(usersDb));
        loginSession(currentPhone, newUser);
    }
}

function loginSession(phone, userData) {
    const sessionData = {
        phone: phone,
        email: phone, // using phone as email fallback
        name: userData.name,
        grade: userData.grade
    };
    alert("Authentication Successful! Redirecting to Dashboard...");
    localStorage.setItem("mj_session", JSON.stringify(sessionData));
    window.location.href = "dashboard.html"; // Goes to new dedicated dashboard
}
