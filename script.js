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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
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

console.log('London Life Command Center - HD Version Initialized');
