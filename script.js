// London Life - Author Command Center JavaScript
// HD Version with AI Integration

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    sessionKey: 'londonlife_session',
    sessionDuration: 24 * 60 * 60 * 1000,
    // Note: API key should be stored securely on backend in production
    aiEnabled: true
};

// ============================================
// AUTHENTICATION
// ============================================

function getSession() {
    try {
        const stored = localStorage.getItem(CONFIG.sessionKey);
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}

function clearSession() {
    localStorage.removeItem(CONFIG.sessionKey);
}

function isSessionExpired(session) {
    return !session.expiresAt || Date.now() > session.expiresAt;
}

function checkAuthStatus() {
    const session = getSession();
    if (!session || !session.authenticated || isSessionExpired(session)) {
        clearSession();
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        clearSession();
        window.location.href = 'login.html';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeApp();
});

function initializeApp() {
    loadSavedContent();
    initParticles();
    initMediaUpload();
    initMediaFilters();
    initPlatformToggles();
    initScheduleToggle();
    initVideoTabs();
    initStatCounters();
    initTutorial();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// ============================================
// CMS TUTORIAL
// ============================================

let currentTutorialStep = 1;
const totalTutorialSteps = 6;

function initTutorial() {
    // Check if user has seen tutorial before
    const tutorialSeen = localStorage.getItem('londonlife_tutorial_seen');
    
    if (!tutorialSeen) {
        // Show tutorial after splash screen
        setTimeout(() => {
            showTutorial();
        }, 1000);
    }
    
    // Add click handlers to dots
    document.querySelectorAll('.tutorial-dots .dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const step = parseInt(dot.dataset.step);
            goToTutorialStep(step);
        });
    });
}

function showTutorial() {
    const tutorial = document.getElementById('cmsTutorial');
    if (tutorial) {
        tutorial.classList.add('active');
        currentTutorialStep = 1;
        updateTutorialUI();
    }
}

function hideTutorial() {
    const tutorial = document.getElementById('cmsTutorial');
    if (tutorial) {
        tutorial.classList.remove('active');
    }
    
    // Check if user wants to hide permanently
    const dontShow = document.getElementById('dontShowTutorial');
    if (dontShow && dontShow.checked) {
        localStorage.setItem('londonlife_tutorial_seen', 'true');
    }
}

function skipTutorial() {
    // Mark as seen if checkbox is checked
    const dontShow = document.getElementById('dontShowTutorial');
    if (dontShow && dontShow.checked) {
        localStorage.setItem('londonlife_tutorial_seen', 'true');
    }
    hideTutorial();
}

function nextTutorialStep() {
    if (currentTutorialStep < totalTutorialSteps) {
        currentTutorialStep++;
        updateTutorialUI();
    } else {
        // Completed tutorial
        localStorage.setItem('londonlife_tutorial_seen', 'true');
        hideTutorial();
        showNotification('Tutorial completed! You\'re all set to use the CMS.', 'success');
    }
}

function goToTutorialStep(step) {
    currentTutorialStep = step;
    updateTutorialUI();
}

function updateTutorialUI() {
    // Update steps
    document.querySelectorAll('.tutorial-step').forEach(stepEl => {
        stepEl.classList.remove('active');
        if (parseInt(stepEl.dataset.step) === currentTutorialStep) {
            stepEl.classList.add('active');
        }
    });
    
    // Update dots
    document.querySelectorAll('.tutorial-dots .dot').forEach(dot => {
        dot.classList.remove('active');
        if (parseInt(dot.dataset.step) === currentTutorialStep) {
            dot.classList.add('active');
        }
    });
    
    // Update button text on last step
    const nextBtn = document.querySelector('.tutorial-btn-next span');
    if (nextBtn) {
        nextBtn.textContent = currentTutorialStep === totalTutorialSteps ? 'Get Started' : 'Next';
    }
}

// ============================================
// SPLASH SCREEN
// ============================================

function enterCommandCenter() {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';
    splash.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        splash.style.display = 'none';
        document.getElementById('commandCenter').classList.add('active');
        initCharts();
        animateStatCounters();
    }, 500);
}

function initParticles() {
    // Simple particle animation via CSS
    const particles = document.getElementById('particles');
    if (particles) {
        // Particles are handled via CSS animation
    }
}

// ============================================
// NAVIGATION
// ============================================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Update active nav link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
    }
    
    // Close mobile nav if open
    closeMobileNav();
}

function toggleMobileNav() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('mobile-open');
}

function closeMobileNav() {
    const nav = document.getElementById('mainNav');
    nav.classList.remove('mobile-open');
}

// ============================================
// MEDIA LIBRARY
// ============================================

let mediaItems = [];
let selectedMedia = [];

function initMediaUpload() {
    const dropZone = document.getElementById('mediaDropZone');
    const uploadInput = document.getElementById('mediaUploadInput');
    
    if (!dropZone) return;
    
    dropZone.addEventListener('click', () => uploadInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFileUpload(e.dataTransfer.files);
    });
    
    uploadInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });
    
    // Modal upload zone
    const modalDropZone = document.getElementById('modalDropZone');
    const modalUploadInput = document.getElementById('modalUploadInput');
    
    if (modalDropZone && modalUploadInput) {
        modalDropZone.addEventListener('click', () => modalUploadInput.click());
        modalUploadInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
            closeModal('uploadModal');
        });
    }
    
    // Initialize checkboxes
    document.querySelectorAll('.media-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActions);
    });
}

function handleFileUpload(files) {
    const progressDiv = document.getElementById('uploadProgress');
    if (progressDiv) {
        progressDiv.style.display = 'block';
    }
    
    Array.from(files).forEach((file, index) => {
        setTimeout(() => {
            // Simulate upload progress
            const reader = new FileReader();
            reader.onload = (e) => {
                addMediaItem({
                    id: Date.now() + index,
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type.startsWith('image/') ? 'images' : 'videos',
                    src: e.target.result
                });
                
                showNotification(`"${file.name}" uploaded successfully!`);
            };
            reader.readAsDataURL(file);
        }, index * 500);
    });
    
    setTimeout(() => {
        if (progressDiv) progressDiv.style.display = 'none';
    }, files.length * 500 + 500);
}

function addMediaItem(item) {
    const grid = document.getElementById('mediaGrid');
    const addNewCard = grid.querySelector('.add-new');
    
    const mediaElement = document.createElement('div');
    mediaElement.className = 'media-item';
    mediaElement.dataset.type = item.type;
    mediaElement.dataset.id = item.id;
    
    mediaElement.innerHTML = `
        <div class="media-thumbnail">
            <img src="${item.src}" alt="${item.name}">
            <div class="media-overlay">
                <button class="media-action" onclick="viewMedia(${item.id})"><i class="fas fa-expand"></i></button>
                <button class="media-action" onclick="editMedia(${item.id})"><i class="fas fa-edit"></i></button>
                <button class="media-action" onclick="deleteMedia(${item.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        <div class="media-info">
            <span class="media-name">${item.name}</span>
            <span class="media-size">${item.size}</span>
        </div>
        <label class="media-select">
            <input type="checkbox" class="media-checkbox" onchange="updateBulkActions()">
            <span class="checkmark"></span>
        </label>
    `;
    
    grid.insertBefore(mediaElement, addNewCard);
    mediaItems.push(item);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function initMediaFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            filterMedia(filter);
        });
    });
    
    const searchInput = document.getElementById('mediaSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchMedia(e.target.value);
        });
    }
}

function filterMedia(type) {
    document.querySelectorAll('.media-item:not(.add-new)').forEach(item => {
        if (type === 'all' || item.dataset.type === type) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function searchMedia(query) {
    const lowerQuery = query.toLowerCase();
    document.querySelectorAll('.media-item:not(.add-new)').forEach(item => {
        const name = item.querySelector('.media-name').textContent.toLowerCase();
        item.style.display = name.includes(lowerQuery) ? '' : 'none';
    });
}

function viewMedia(id) {
    const item = document.querySelector(`.media-item[data-id="${id}"]`);
    if (item) {
        const img = item.querySelector('.media-thumbnail img');
        const viewerImg = document.getElementById('viewerImage');
        viewerImg.src = img.src;
        openModal('imageViewerModal');
    }
}

function editMedia(id) {
    showNotification('Edit functionality coming soon!');
}

function deleteMedia(id) {
    if (confirm('Are you sure you want to delete this media?')) {
        const item = document.querySelector(`.media-item[data-id="${id}"]`);
        if (item) {
            item.remove();
            showNotification('Media deleted');
        }
    }
}

function updateBulkActions() {
    const checked = document.querySelectorAll('.media-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    const countSpan = bulkActions.querySelector('.selected-count');
    
    if (checked.length > 0) {
        bulkActions.style.display = 'flex';
        countSpan.textContent = `${checked.length} selected`;
    } else {
        bulkActions.style.display = 'none';
    }
}

function clearSelection() {
    document.querySelectorAll('.media-checkbox').forEach(cb => cb.checked = false);
    updateBulkActions();
}

function bulkDownload() {
    showNotification('Downloading selected files...');
    clearSelection();
}

function bulkDelete() {
    const checked = document.querySelectorAll('.media-checkbox:checked');
    if (confirm(`Delete ${checked.length} items?`)) {
        checked.forEach(cb => {
            cb.closest('.media-item').remove();
        });
        showNotification('Items deleted');
        clearSelection();
    }
}

// ============================================
// MEDIA PICKER FOR POSTS
// ============================================

function openMediaPicker() {
    const grid = document.getElementById('mediaPickerGrid');
    grid.innerHTML = '';
    
    document.querySelectorAll('.media-item:not(.add-new) .media-thumbnail img').forEach(img => {
        const item = document.createElement('div');
        item.className = 'media-picker-item';
        item.innerHTML = `<img src="${img.src}" alt="Media">`;
        item.addEventListener('click', () => item.classList.toggle('selected'));
        grid.appendChild(item);
    });
    
    openModal('mediaPickerModal');
}

function confirmMediaSelection() {
    const selected = document.querySelectorAll('.media-picker-item.selected img');
    const attachedItems = document.getElementById('attachedItems');
    const attachedMedia = document.getElementById('attachedMedia');
    
    if (selected.length > 0) {
        attachedMedia.style.display = 'block';
        
        selected.forEach(img => {
            const item = document.createElement('div');
            item.className = 'attached-item';
            item.innerHTML = `
                <img src="${img.src}" alt="Attached">
                <button class="remove-attached" onclick="this.parentElement.remove(); checkAttachedMedia();">
                    <i class="fas fa-times"></i>
                </button>
            `;
            attachedItems.appendChild(item);
        });
    }
    
    closeModal('mediaPickerModal');
}

function checkAttachedMedia() {
    const attachedItems = document.getElementById('attachedItems');
    const attachedMedia = document.getElementById('attachedMedia');
    
    if (attachedItems.children.length === 0) {
        attachedMedia.style.display = 'none';
    }
}

// ============================================
// AI POST GENERATION
// ============================================

async function generateAIPost() {
    const topic = document.getElementById('aiTopic').value;
    const tone = document.getElementById('aiTone').value;
    const platform = document.getElementById('aiPlatform').value;
    const context = document.getElementById('aiContext').value;
    const includeHashtags = document.getElementById('aiHashtags').checked;
    
    if (!topic.trim()) {
        showNotification('Please enter a topic');
        return;
    }
    
    const btn = document.querySelector('.generate-ai-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;
    
    try {
        // Build prompt for AI
        const prompt = buildAIPrompt(topic, tone, platform, context, includeHashtags);
        
        // Call Venice AI API
        const response = await callVeniceAI(prompt);
        
        // Display result
        const outputDiv = document.getElementById('aiOutput');
        const resultDiv = document.getElementById('aiResult');
        
        resultDiv.textContent = response;
        outputDiv.style.display = 'block';
        
        showNotification('Post generated successfully!');
        
    } catch (error) {
        console.error('AI Generation Error:', error);
        showNotification('Failed to generate post. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function buildAIPrompt(topic, tone, platform, context, includeHashtags) {
    let prompt = `Write a ${tone} social media post for ${platform} about: ${topic}.`;
    
    if (context) {
        prompt += ` Additional context: ${context}`;
    }
    
    prompt += ` The post is for "London Life: Be Good To People" - a memoir by Artem Artemenko about resilience, forgiveness, and overcoming adversity in London.`;
    
    if (platform === 'twitter') {
        prompt += ' Keep it under 280 characters.';
    } else if (platform === 'instagram') {
        prompt += ' Make it engaging with line breaks for readability.';
    }
    
    if (includeHashtags) {
        prompt += ' Include 5-8 relevant hashtags at the end.';
    }
    
    return prompt;
}

async function callVeniceAI(prompt) {
    // Venice AI API call
    // Note: In production, this should go through your backend to protect the API key
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer vck_4xUXXOKyubiSZNL3Ycx6j1b55vpThzxayKNsovdrTTtjvv6Su13MBpYy'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b',
            messages: [
                {
                    role: 'system',
                    content: 'You are a social media expert and copywriter for an author. Create engaging, authentic posts that connect with readers.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        throw new Error('API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

async function aiGenerateCaption(style) {
    const postContent = document.getElementById('postContent');
    const existingText = postContent.value.trim();
    
    let prompt = '';
    
    switch (style) {
        case 'inspiring':
            prompt = 'Write an inspiring quote or message about resilience and personal growth, related to the book "London Life: Be Good To People"';
            break;
        case 'promotional':
            prompt = 'Write a promotional post encouraging people to read "London Life: Be Good To People" by Artem Artemenko';
            break;
        case 'storytelling':
            prompt = 'Write a short storytelling post about life lessons learned in London, in the style of the memoir "London Life"';
            break;
        case 'engaging':
            prompt = 'Write an engaging question or conversation starter about overcoming adversity, related to the themes in "London Life"';
            break;
    }
    
    if (existingText) {
        prompt += ` Incorporate or enhance this existing text: "${existingText}"`;
    }
    
    prompt += ' Include relevant hashtags. Keep it suitable for Instagram and Twitter.';
    
    postContent.placeholder = 'Generating...';
    
    try {
        const response = await callVeniceAI(prompt);
        postContent.value = response;
        showNotification('Caption generated!');
    } catch (error) {
        showNotification('Generation failed. Please try again.');
    }
    
    postContent.placeholder = "What's on your mind? Share your London Life story...";
}

function openAIAssist() {
    openModal('aiPostModal');
}

function copyAIPost() {
    const text = document.getElementById('aiResult').textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!');
    });
}

function useAIPost() {
    const text = document.getElementById('aiResult').textContent;
    document.getElementById('postContent').value = text;
    closeModal('aiPostModal');
    showNotification('Post added to composer!');
}

function regeneratePost() {
    generateAIPost();
}

function addHashtags() {
    const postContent = document.getElementById('postContent');
    const hashtags = '\n\n#LondonLife #BeGoodToPeople #ArtemArtemenko #Memoir #BookRecommendation #Resilience #London #AuthorLife #BookLovers #InspirationalReads';
    
    if (!postContent.value.includes('#LondonLife')) {
        postContent.value += hashtags;
        showNotification('Hashtags added!');
    }
}

// ============================================
// SOCIAL COMPOSER
// ============================================

function initPlatformToggles() {
    document.querySelectorAll('.platform-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
}

function initScheduleToggle() {
    document.querySelectorAll('input[name="postTime"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const scheduleInput = document.getElementById('scheduleTime');
            scheduleInput.classList.toggle('hidden', this.value !== 'schedule');
        });
    });
}

function publishPost() {
    const content = document.getElementById('postContent').value;
    const platforms = [];
    
    document.querySelectorAll('.platform-toggle.active').forEach(toggle => {
        platforms.push(toggle.dataset.platform);
    });
    
    if (!content.trim()) {
        showNotification('Please enter post content!');
        return;
    }
    
    if (platforms.length === 0) {
        showNotification('Please select at least one platform!');
        return;
    }
    
    // Add to scheduled posts
    addToPostQueue(content, platforms);
    
    showNotification(`Post published to ${platforms.join(', ')}!`);
    document.getElementById('postContent').value = '';
    
    // Clear attached media
    const attachedItems = document.getElementById('attachedItems');
    attachedItems.innerHTML = '';
    document.getElementById('attachedMedia').style.display = 'none';
}

function saveDraft() {
    const content = document.getElementById('postContent').value;
    if (content.trim()) {
        localStorage.setItem('londonlife_draft', content);
        showNotification('Draft saved!');
    }
}

function addToPostQueue(content, platforms) {
    const queue = document.getElementById('postQueue');
    const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const platformIcons = platforms.map(p => {
        const iconMap = {
            instagram: 'fab fa-instagram',
            tiktok: 'fab fa-tiktok',
            twitter: 'fab fa-x-twitter',
            facebook: 'fab fa-facebook',
            linkedin: 'fab fa-linkedin',
            youtube: 'fab fa-youtube'
        };
        return `<i class="${iconMap[p] || 'fas fa-globe'}"></i>`;
    }).join('');
    
    const postElement = document.createElement('div');
    postElement.className = 'queued-post';
    postElement.innerHTML = `
        <div class="post-preview">
            <img src="IMG_1218.jpeg" alt="Post">
        </div>
        <div class="post-details">
            <p>"${preview}"</p>
            <span class="post-time"><i class="fas fa-clock"></i> ${timeStr}</span>
            <div class="post-platforms">${platformIcons}</div>
        </div>
        <div class="post-actions">
            <button class="edit-post"><i class="fas fa-edit"></i></button>
            <button class="delete-post" onclick="this.closest('.queued-post').remove()"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    queue.insertBefore(postElement, queue.firstChild);
}

// ============================================
// VIDEO GENERATION
// ============================================

function initVideoTabs() {
    document.querySelectorAll('.gen-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.gen-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

const videoPrompts = {
    'london-rain': 'Cinematic close-up of rain droplets sliding down a window, soft bokeh lights of London city in background, reflections of neon signs, melancholic atmosphere, 4K quality, slow motion',
    'book-reveal': 'Elegant book reveal animation, "London Life" book emerging from darkness with dramatic spotlight, pages gently fluttering, dust particles in light beam, cinematic lighting',
    'author-intro': 'Professional author portrait style video, sophisticated urban London backdrop, warm golden hour lighting, subtle camera movement, film grain texture',
    'testimonial': 'Abstract flowing particles in orange and gold tones, subtle wave motion, perfect for text overlay, minimalist dark background, smooth looping animation',
    'quote-card': 'Animated typography reveal on dark textured background, elegant serif font appearing letter by letter, subtle golden sparkle effects'
};

function setPrompt(type) {
    const textarea = document.getElementById('videoPrompt');
    textarea.value = videoPrompts[type] || '';
}

function generateVideo() {
    const prompt = document.getElementById('videoPrompt').value;
    const duration = document.getElementById('videoDuration').value;
    const aspect = document.getElementById('aspectRatio').value;
    const style = document.getElementById('videoStyle').value;
    const activeTab = document.querySelector('.gen-tab.active').dataset.gen;
    
    showNotification(`Video generation started with ${activeTab.toUpperCase()}!`);
    
    // In production, this would call the actual video generation API
    console.log('Video Generation:', { platform: activeTab, prompt, duration, aspect, style });
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

function saveContent(type) {
    const content = document.getElementById(type).value;
    localStorage.setItem(`londonLife_${type}`, content);
    showNotification('Content saved!');
}

function loadSavedContent() {
    ['synopsis', 'authorBio', 'excerpt'].forEach(type => {
        const saved = localStorage.getItem(`londonLife_${type}`);
        const element = document.getElementById(type);
        if (saved && element) element.value = saved;
    });
    
    // Load draft
    const draft = localStorage.getItem('londonlife_draft');
    const postContent = document.getElementById('postContent');
    if (draft && postContent) postContent.value = draft;
}

// ============================================
// CHARTS
// ============================================

function initCharts() {
    ['salesChart', 'trafficChart', 'engagementChart'].forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight || 200;
            drawChart(ctx, canvas.width, canvas.height);
        }
    });
}

function drawChart(ctx, width, height) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Line chart
    const points = [0.3, 0.5, 0.4, 0.7, 0.6, 0.8, 0.7, 0.9, 0.85];
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    points.forEach((point, i) => {
        const x = (width / (points.length - 1)) * i;
        const y = height - (point * height * 0.8) - (height * 0.1);
        ctx.lineTo(x, y);
    });
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
    
    // Line
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    points.forEach((point, i) => {
        const x = (width / (points.length - 1)) * i;
        const y = height - (point * height * 0.8) - (height * 0.1);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
    
    // Points
    ctx.fillStyle = '#ff6b35';
    points.forEach((point, i) => {
        const x = (width / (points.length - 1)) * i;
        const y = height - (point * height * 0.8) - (height * 0.1);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ============================================
// STAT COUNTERS
// ============================================

function initStatCounters() {
    // Stats will animate when entering command center
}

function animateStatCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach(stat => {
        const target = parseInt(stat.dataset.count);
        const duration = 1500;
        const start = 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            
            stat.textContent = formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    });
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

// ============================================
// MODALS
// ============================================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ============================================
// UTILITIES
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
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
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleKeyboard(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
    
    if (e.key === 'Enter' && document.getElementById('splash').style.display !== 'none') {
        enterCommandCenter();
    }
}

// Copy link functionality
document.querySelectorAll('.copy-link').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        navigator.clipboard.writeText(input.value).then(() => {
            showNotification('Link copied!');
        });
    });
});

// Add animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(styleSheet);

// Image viewer functions
function downloadImage() {
    const img = document.getElementById('viewerImage');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = 'london-life-image.jpg';
    link.click();
}

function shareImage() {
    const img = document.getElementById('viewerImage');
    if (navigator.share) {
        navigator.share({
            title: 'London Life - Image',
            url: img.src
        });
    } else {
        navigator.clipboard.writeText(img.src).then(() => {
            showNotification('Image URL copied!');
        });
    }
}

// ============================================
// CMS FUNCTIONS FOR LANDING PAGE
// ============================================

const CMS_STORAGE_KEY = 'londonlife_cms';
let cmsReviews = [];

// Default CMS content
const defaultCMSContent = {
    hero: {
        badge: 'NEW RELEASE',
        titleLine1: 'LONDON',
        titleLine2: 'LIFE',
        subtitle: 'Be Good To People',
        author: 'Artem Artemenko',
        description: 'A compelling memoir about resilience, forgiveness, and the unwavering strength of the human spirit in the bustling streets of London.',
        ctaText: 'Order Now',
        stats: { sales: '1,200+', rating: '4.8', reviews: '150+' }
    },
    about: {
        title: 'A Journey Through Adversity',
        lead: 'Within the pages of this compelling memoir, Artem recounts a journey through betrayal and injustice in the bustling streets of London.',
        text: 'Through personal trials & triumphs, Artem discovers the unwavering strength of resilience & the transformative power of forgiveness. His story is a poignant reminder that even in the face of adversity, the human spirit has the capacity to overcome and thrive.',
        features: ['A story of resilience', 'Set in London', 'Memoir & Life Lessons'],
        format: 'Paperback', pages: '256', isbn: '9798893970265', price: '£15.99'
    },
    excerpt: {
        text: '"The streets of London taught me more about life than any classroom ever could. In the chaos of the city, I found my purpose. In the betrayal of those I trusted, I discovered my strength."',
        chapter: 'New Beginnings'
    },
    author: {
        name: 'Artem Artemenko',
        bio: 'Artem Artemenko is a London-based author whose debut memoir "London Life: Be Good To People" captures the essence of resilience and human spirit.',
        bioExtended: 'Born with a passion for storytelling, Artem uses his experiences to inspire others to embrace life\'s challenges.',
        social: { instagram: '', tiktok: '', twitter: '', amazon: '' }
    },
    reviews: [
        { stars: 5, text: 'An incredibly moving story that stayed with me long after I finished reading.', name: 'Sarah M.', source: 'Amazon Review' },
        { stars: 5, text: 'A raw and honest account of life\'s challenges.', name: 'James K.', source: 'Goodreads' },
        { stars: 4.5, text: 'Beautifully written with vivid descriptions of London.', name: 'Emma L.', source: 'Book Blog' }
    ],
    buy: { price: '£15.99', links: { amazon: '', barnes: '', direct: '', signed: '' } },
    newsletter: { title: 'Stay Connected', text: 'Subscribe to receive updates and news.' },
    contact: { email: 'contact@londonlife-book.com', location: 'London, United Kingdom' }
};

function switchCMSTab(tabName) {
    document.querySelectorAll('.cms-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cms-panel').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.cms-tab[onclick="switchCMSTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`cms-${tabName}`).classList.add('active');
}

function loadCMSToForm() {
    const content = JSON.parse(localStorage.getItem(CMS_STORAGE_KEY)) || defaultCMSContent;
    
    // Hero
    setValue('cms-hero-badge', content.hero?.badge);
    setValue('cms-hero-title1', content.hero?.titleLine1);
    setValue('cms-hero-title2', content.hero?.titleLine2);
    setValue('cms-hero-subtitle', content.hero?.subtitle);
    setValue('cms-hero-description', content.hero?.description);
    setValue('cms-hero-cta', content.hero?.ctaText);
    setValue('cms-hero-sales', content.hero?.stats?.sales);
    setValue('cms-hero-rating', content.hero?.stats?.rating);
    setValue('cms-hero-reviews', content.hero?.stats?.reviews);
    
    // About
    setValue('cms-about-title', content.about?.title);
    setValue('cms-about-lead', content.about?.lead);
    setValue('cms-about-text', content.about?.text);
    setValue('cms-about-feature1', content.about?.features?.[0]);
    setValue('cms-about-feature2', content.about?.features?.[1]);
    setValue('cms-about-feature3', content.about?.features?.[2]);
    setValue('cms-about-format', content.about?.format);
    setValue('cms-about-pages', content.about?.pages);
    setValue('cms-about-isbn', content.about?.isbn);
    setValue('cms-about-price', content.about?.price);
    
    // Excerpt
    setValue('cms-excerpt-text', content.excerpt?.text);
    setValue('cms-excerpt-chapter', content.excerpt?.chapter);
    
    // Author
    setValue('cms-author-name', content.author?.name);
    setValue('cms-author-bio', content.author?.bio);
    setValue('cms-author-bio-ext', content.author?.bioExtended);
    setValue('cms-author-instagram', content.author?.social?.instagram);
    setValue('cms-author-tiktok', content.author?.social?.tiktok);
    setValue('cms-author-twitter', content.author?.social?.twitter);
    setValue('cms-author-amazon', content.author?.social?.amazon);
    
    // Buy
    setValue('cms-buy-price', content.buy?.price);
    setValue('cms-buy-amazon', content.buy?.links?.amazon);
    setValue('cms-buy-barnes', content.buy?.links?.barnes);
    setValue('cms-buy-direct', content.buy?.links?.direct);
    setValue('cms-buy-signed', content.buy?.links?.signed);
    
    // Newsletter
    setValue('cms-newsletter-title', content.newsletter?.title);
    setValue('cms-newsletter-text', content.newsletter?.text);
    setValue('cms-contact-email', content.contact?.email);
    setValue('cms-contact-location', content.contact?.location);
    
    // Reviews
    cmsReviews = content.reviews || [];
    renderCMSReviews();
    
    // Load subscribers
    loadSubscribers();
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.value = value;
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function saveCMSContent() {
    const content = {
        hero: {
            badge: getValue('cms-hero-badge'),
            titleLine1: getValue('cms-hero-title1'),
            titleLine2: getValue('cms-hero-title2'),
            subtitle: getValue('cms-hero-subtitle'),
            author: getValue('cms-author-name'),
            description: getValue('cms-hero-description'),
            ctaText: getValue('cms-hero-cta'),
            stats: {
                sales: getValue('cms-hero-sales'),
                rating: getValue('cms-hero-rating'),
                reviews: getValue('cms-hero-reviews')
            }
        },
        about: {
            title: getValue('cms-about-title'),
            lead: getValue('cms-about-lead'),
            text: getValue('cms-about-text'),
            features: [getValue('cms-about-feature1'), getValue('cms-about-feature2'), getValue('cms-about-feature3')],
            format: getValue('cms-about-format'),
            pages: getValue('cms-about-pages'),
            isbn: getValue('cms-about-isbn'),
            price: getValue('cms-about-price')
        },
        excerpt: {
            text: getValue('cms-excerpt-text'),
            chapter: getValue('cms-excerpt-chapter')
        },
        author: {
            name: getValue('cms-author-name'),
            bio: getValue('cms-author-bio'),
            bioExtended: getValue('cms-author-bio-ext'),
            social: {
                instagram: getValue('cms-author-instagram'),
                tiktok: getValue('cms-author-tiktok'),
                twitter: getValue('cms-author-twitter'),
                amazon: getValue('cms-author-amazon')
            }
        },
        reviews: cmsReviews,
        buy: {
            price: getValue('cms-buy-price'),
            links: {
                amazon: getValue('cms-buy-amazon'),
                barnes: getValue('cms-buy-barnes'),
                direct: getValue('cms-buy-direct'),
                signed: getValue('cms-buy-signed')
            }
        },
        newsletter: {
            title: getValue('cms-newsletter-title'),
            text: getValue('cms-newsletter-text')
        },
        contact: {
            email: getValue('cms-contact-email'),
            location: getValue('cms-contact-location')
        }
    };
    
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(content));
    showNotification('Landing page content saved & published!');
}

function resetCMSContent() {
    if (confirm('Reset all landing page content to defaults?')) {
        localStorage.removeItem(CMS_STORAGE_KEY);
        loadCMSToForm();
        showNotification('Content reset to defaults');
    }
}

function renderCMSReviews() {
    const container = document.getElementById('cmsReviewsList');
    if (!container) return;
    
    container.innerHTML = cmsReviews.map((review, index) => `
        <div class="review-item" data-index="${index}">
            <div class="review-item-header">
                <input type="text" value="${review.name}" placeholder="Reviewer name" onchange="updateReview(${index}, 'name', this.value)">
                <select onchange="updateReview(${index}, 'stars', parseFloat(this.value))">
                    <option value="5" ${review.stars === 5 ? 'selected' : ''}>5 Stars</option>
                    <option value="4.5" ${review.stars === 4.5 ? 'selected' : ''}>4.5 Stars</option>
                    <option value="4" ${review.stars === 4 ? 'selected' : ''}>4 Stars</option>
                    <option value="3.5" ${review.stars === 3.5 ? 'selected' : ''}>3.5 Stars</option>
                    <option value="3" ${review.stars === 3 ? 'selected' : ''}>3 Stars</option>
                </select>
            </div>
            <textarea placeholder="Review text" onchange="updateReview(${index}, 'text', this.value)">${review.text}</textarea>
            <div class="review-item-footer">
                <input type="text" value="${review.source}" placeholder="Source (Amazon, Goodreads)" onchange="updateReview(${index}, 'source', this.value)">
                <button class="delete-review-btn" onclick="deleteReview(${index})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function addNewReview() {
    cmsReviews.push({ stars: 5, text: '', name: '', source: '' });
    renderCMSReviews();
}

function updateReview(index, field, value) {
    cmsReviews[index][field] = value;
}

function deleteReview(index) {
    cmsReviews.splice(index, 1);
    renderCMSReviews();
}

function loadSubscribers() {
    const subscribers = JSON.parse(localStorage.getItem('londonlife_subscribers') || '[]');
    const container = document.getElementById('subscribersList');
    const countEl = document.getElementById('subscriberCount');
    
    if (!container) return;
    
    countEl.textContent = subscribers.length;
    
    if (subscribers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-dim);">No subscribers yet.</p>';
        return;
    }
    
    container.innerHTML = subscribers.map(email => `
        <div class="subscriber-item">
            <span>${email}</span>
        </div>
    `).join('');
}

function exportSubscribers() {
    const subscribers = JSON.parse(localStorage.getItem('londonlife_subscribers') || '[]');
    if (subscribers.length === 0) {
        showNotification('No subscribers to export');
        return;
    }
    
    const csv = 'Email\n' + subscribers.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'london-life-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Subscribers exported!');
}

// Initialize CMS on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadCMSToForm, 100);
});

console.log('London Life Command Center - HD Version Initialized');
