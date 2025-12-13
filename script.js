// London Life - Author Command Center JavaScript

// ============================================
// SECURE AUTHENTICATION SYSTEM
// ============================================

const AUTH_CONFIG = {
    sessionKey: 'londonlife_session',
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
};

// Rate limiting storage
let loginAttempts = {
    count: 0,
    lastAttempt: null,
    lockedUntil: null
};

// Check if user is already authenticated on page load
function checkAuthStatus() {
    const session = getSession();
    if (session && session.authenticated && !isSessionExpired(session)) {
        // User is authenticated - hide login, show splash
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('splash').style.display = 'flex';
        return true;
    }
    clearSession();
    showLoginScreen();
    return false;
}

function getSession() {
    try {
        const stored = localStorage.getItem(AUTH_CONFIG.sessionKey);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
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

function clearSession() {
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
}

function isSessionExpired(session) {
    return !session.expiresAt || Date.now() > session.expiresAt;
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('splash').style.display = 'none';
    document.getElementById('commandCenter').classList.remove('active');
}

function hideLoginScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    // Show the original splash screen after login
    document.getElementById('splash').style.display = 'flex';
}

// Secure password hashing using Web Crypto API
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check rate limiting
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

// Main login handler
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorEl = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    
    // Clear previous errors
    errorEl.textContent = '';
    
    // Check rate limiting
    const rateLimit = isRateLimited();
    if (rateLimit.limited) {
        errorEl.textContent = rateLimit.message;
        return;
    }
    
    // Basic validation
    if (!email || !password) {
        errorEl.textContent = 'Please enter both email and password.';
        return;
    }
    
    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    try {
        // Simulate async authentication (replace with real API call)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Demo credentials - REPLACE WITH REAL AUTHENTICATION
        // In production, this should call your backend API
        const validCredentials = await validateCredentials(email, password);
        
        if (validCredentials) {
            recordLoginAttempt(true);
            
            // Set session
            setSession({
                email: email,
                rememberMe: rememberMe,
                loginTime: new Date().toISOString()
            });
            
            // Hide login, show original splash screen
            hideLoginScreen();
            
            showNotification('Welcome back, Artem!');
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
        console.error('Login error:', err);
    } finally {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
    }
}

// Credential validation (DEMO - replace with real backend auth)
async function validateCredentials(email, password) {
    // IMPORTANT: In production, NEVER store credentials client-side
    // This should be an API call to your backend
    // Demo credentials for testing:
    const DEMO_EMAIL = 'artem@londonlife.com';
    const DEMO_SALT = 'londonlife2025';
    // Demo password: "LondonLife2025!" - hash generated with SHA-256
    const DEMO_HASH = 'a1b2c3d4e5f6'; // Placeholder - will be set below
    
    // For demo purposes, accept these credentials:
    // Email: artem@londonlife.com
    // Password: LondonLife2025!
    if (email.toLowerCase() === DEMO_EMAIL && password === 'LondonLife2025!') {
        return true;
    }
    
    return false;
}

function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        clearSession();
        showLoginScreen();
        document.getElementById('commandCenter').classList.remove('active');
        showNotification('You have been signed out.');
    }
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

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// ============================================
// END AUTHENTICATION SYSTEM
// ============================================

// Splash Screen Enter
function enterCommandCenter() {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('commandCenter').classList.add('active');
    initCharts();
}

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        document.querySelector(target.replace('#', '#') + '-section') || 
        document.querySelector(target + '').scrollIntoView({ behavior: 'smooth' });
    });
});

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Platform Toggle
document.querySelectorAll('.platform-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
        this.classList.toggle('active');
    });
});

// Schedule Toggle
document.querySelectorAll('input[name="postTime"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const scheduleInput = document.getElementById('scheduleTime');
        if (this.value === 'schedule') {
            scheduleInput.classList.remove('hidden');
        } else {
            scheduleInput.classList.add('hidden');
        }
    });
});

// AI Video Generator Tabs
document.querySelectorAll('.gen-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.gen-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// Video Prompt Presets
const prompts = {
    'london-rain': 'Cinematic close-up of rain droplets sliding down a window, soft bokeh lights of London city in background, reflections of neon signs, melancholic atmosphere, 4K quality, slow motion, ambient lighting',
    'book-reveal': 'Elegant book reveal animation, "London Life" book emerging from darkness with dramatic spotlight, pages gently fluttering, dust particles in light beam, dark luxurious background, cinematic lighting',
    'author-intro': 'Professional author portrait style video, sophisticated urban London backdrop, warm golden hour lighting, subtle camera movement, confident and approachable atmosphere, film grain texture',
    'testimonial': 'Abstract flowing particles in orange and gold tones, subtle wave motion, perfect for text overlay, minimalist dark background, smooth looping animation, corporate yet artistic feel',
    'quote-card': 'Animated typography reveal on dark textured background, elegant serif font appearing letter by letter, subtle golden sparkle effects, inspirational quote presentation style'
};

function setPrompt(type) {
    document.getElementById('videoPrompt').value = prompts[type] || '';
}

// Generate Video (Placeholder)
function generateVideo() {
    const prompt = document.getElementById('videoPrompt').value;
    const duration = document.getElementById('videoDuration').value;
    const aspect = document.getElementById('aspectRatio').value;
    const style = document.getElementById('videoStyle').value;
    
    const activeTab = document.querySelector('.gen-tab.active').dataset.gen;
    
    alert(`Video Generation Request Sent!\n\nPlatform: ${activeTab.toUpperCase()}\nDuration: ${duration}s\nAspect Ratio: ${aspect}\nStyle: ${style}\n\nPrompt: ${prompt.substring(0, 100)}...`);
    
    // In production, this would call the respective AI API
    console.log('Video Generation:', { platform: activeTab, prompt, duration, aspect, style });
}

// Select Background Variant
function selectVariant(type) {
    const variantPrompts = {
        'rain': 'Continuous rain drops on glass window, London city lights bokeh in background, cozy indoor perspective, moody atmosphere, perfect loop',
        'skyline': 'London skyline at golden hour transitioning to dusk, Tower Bridge and Shard visible, warm orange to deep blue gradient, time-lapse style',
        'pages': 'Book pages gently turning in soft breeze, warm reading light, close-up macro shot, paper texture visible, peaceful and contemplative',
        'lights': 'Abstract bokeh lights floating gently, warm orange and gold tones, slow drifting motion, romantic city night atmosphere',
        'fog': 'Atmospheric London fog rolling through cobblestone streets, vintage lamp posts glowing, mysterious and nostalgic, Victorian era feeling',
        'abstract': 'Flowing liquid gradient animation in orange and dark tones, smooth organic shapes morphing, modern and artistic, seamless loop'
    };
    
    document.getElementById('videoPrompt').value = variantPrompts[type] || '';
    document.querySelector('.ai-video-generator').scrollIntoView({ behavior: 'smooth' });
}

// Save Content
function saveContent(type) {
    const content = document.getElementById(type).value;
    localStorage.setItem(`londonLife_${type}`, content);
    showNotification('Content saved successfully!');
}

// Load Saved Content
function loadSavedContent() {
    ['synopsis', 'authorBio', 'excerpt'].forEach(type => {
        const saved = localStorage.getItem(`londonLife_${type}`);
        if (saved) {
            const element = document.getElementById(type);
            if (element) element.value = saved;
        }
    });
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b35, #ee5a24);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Publish Post (Placeholder)
function publishPost() {
    const content = document.getElementById('postContent').value;
    const platforms = [];
    
    document.querySelectorAll('.platform-toggle.active').forEach(toggle => {
        platforms.push(toggle.dataset.platform);
    });
    
    if (!content.trim()) {
        alert('Please enter post content!');
        return;
    }
    
    if (platforms.length === 0) {
        alert('Please select at least one platform!');
        return;
    }
    
    showNotification(`Post published to ${platforms.join(', ')}!`);
    document.getElementById('postContent').value = '';
}

// Copy Link
document.querySelectorAll('.copy-link').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        input.select();
        document.execCommand('copy');
        showNotification('Link copied to clipboard!');
    });
});

// Initialize Charts (using placeholder since Chart.js would need to be loaded)
function initCharts() {
    const salesCanvas = document.getElementById('salesChart');
    const trafficCanvas = document.getElementById('trafficChart');
    const engagementCanvas = document.getElementById('engagementChart');
    
    // Placeholder chart visualization
    [salesCanvas, trafficCanvas, engagementCanvas].forEach(canvas => {
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            
            // Draw placeholder chart
            drawPlaceholderChart(ctx, canvas.width, canvas.height);
        }
    });
}

function drawPlaceholderChart(ctx, width, height) {
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw sample line chart
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const points = [0.7, 0.5, 0.6, 0.4, 0.8, 0.6, 0.9, 0.7, 0.85];
    points.forEach((point, i) => {
        const x = (width / (points.length - 1)) * i;
        const y = height - (point * height * 0.8) - (height * 0.1);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    points.forEach((point, i) => {
        const x = (width / (points.length - 1)) * i;
        const y = height - (point * height * 0.8) - (height * 0.1);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Enter to access command center from splash
    if (e.key === 'Enter' && document.getElementById('splash').style.display !== 'none') {
        enterCommandCenter();
    }
});

// File upload handling
document.querySelectorAll('.file-upload').forEach(upload => {
    upload.addEventListener('click', function() {
        this.querySelector('input[type="file"]').click();
    });
    
    upload.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ff6b35';
    });
    
    upload.addEventListener('dragleave', function() {
        this.style.borderColor = 'rgba(255,255,255,0.2)';
    });
    
    upload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'rgba(255,255,255,0.2)';
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });
});

function handleFileUpload(files) {
    Array.from(files).forEach(file => {
        console.log('File uploaded:', file.name);
        showNotification(`File "${file.name}" uploaded!`);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    loadSavedContent();
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Video Card Click Handler
document.querySelectorAll('.video-card:not(.add-new)').forEach(card => {
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.video-actions')) {
            showNotification('Video preview coming soon!');
        }
    });
});

// Add New Video Card
document.querySelector('.video-card.add-new')?.addEventListener('click', function() {
    document.querySelector('.ai-video-generator').scrollIntoView({ behavior: 'smooth' });
});

// Gallery Item Click
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            cursor: pointer;
        `;
        modal.innerHTML = `<img src="${img.src}" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px;">`;
        modal.addEventListener('click', () => modal.remove());
        document.body.appendChild(modal);
    });
});

console.log('London Life Command Center Initialized');
