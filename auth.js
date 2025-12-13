// London Life - Authentication System

const AUTH_CONFIG = {
    sessionKey: 'londonlife_session',
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,
    sessionDuration: 24 * 60 * 60 * 1000,
};

let loginAttempts = { count: 0, lastAttempt: null, lockedUntil: null };

// Check if already authenticated - redirect to main app
function checkAuthOnLogin() {
    const session = getSession();
    if (session && session.authenticated && !isSessionExpired(session)) {
        window.location.href = 'index.html';
    }
}

function getSession() {
    try {
        const stored = localStorage.getItem(AUTH_CONFIG.sessionKey);
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}

function setSession(data) {
    const session = {
        authenticated: true,
        timestamp: Date.now(),
        expiresAt: Date.now() + AUTH_CONFIG.sessionDuration,
        ...data
    };
    localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
}

function isSessionExpired(session) {
    return !session.expiresAt || Date.now() > session.expiresAt;
}

function isRateLimited() {
    if (loginAttempts.lockedUntil && Date.now() < loginAttempts.lockedUntil) {
        const remaining = Math.ceil((loginAttempts.lockedUntil - Date.now()) / 60000);
        return { limited: true, message: `Too many attempts. Try again in ${remaining} minute(s).` };
    }
    if (loginAttempts.lockedUntil && Date.now() >= loginAttempts.lockedUntil) {
        loginAttempts = { count: 0, lastAttempt: null, lockedUntil: null };
    }
    return { limited: false };
}

function recordLoginAttempt(success) {
    if (success) {
        loginAttempts = { count: 0, lastAttempt: null, lockedUntil: null };
    } else {
        loginAttempts.count++;
        loginAttempts.lastAttempt = Date.now();
        if (loginAttempts.count >= AUTH_CONFIG.maxAttempts) {
            loginAttempts.lockedUntil = Date.now() + AUTH_CONFIG.lockoutDuration;
        }
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorEl = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    
    errorEl.textContent = '';
    
    const rateLimit = isRateLimited();
    if (rateLimit.limited) {
        errorEl.textContent = rateLimit.message;
        return;
    }
    
    if (!email || !password) {
        errorEl.textContent = 'Please enter both email and password.';
        return;
    }
    
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const validCredentials = await validateCredentials(email, password);
        
        if (validCredentials) {
            recordLoginAttempt(true);
            setSession({ email, rememberMe, loginTime: new Date().toISOString() });
            window.location.href = 'index.html';
        } else {
            recordLoginAttempt(false);
            const attemptsLeft = AUTH_CONFIG.maxAttempts - loginAttempts.count;
            if (attemptsLeft > 0) {
                errorEl.textContent = `Invalid credentials. ${attemptsLeft} attempt(s) remaining.`;
            } else {
                errorEl.textContent = 'Account locked. Try again in 15 minutes.';
            }
        }
    } catch (err) {
        errorEl.textContent = 'Authentication error. Please try again.';
    } finally {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

async function validateCredentials(email, password) {
    const DEMO_EMAIL = 'artem@londonlife.com';
    if (email.toLowerCase() === DEMO_EMAIL && password === 'LondonLife2025!') {
        return true;
    }
    return false;
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

function showForgotPassword(event) {
    event.preventDefault();
    alert('Password reset functionality would be implemented here.\n\nContact: support@londonlife.com');
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', checkAuthOnLogin);
