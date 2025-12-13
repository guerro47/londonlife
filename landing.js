// London Life - Customer Landing Page JavaScript
// Content is managed via CMS in the Author Command Center

const CMS_STORAGE_KEY = 'londonlife_cms';

// Default content (fallback if CMS not configured)
const defaultContent = {
    hero: {
        badge: 'NEW RELEASE',
        titleLine1: 'LONDON',
        titleLine2: 'LIFE',
        subtitle: 'Be Good To People',
        author: 'Artem Artemenko',
        description: 'A compelling memoir about resilience, forgiveness, and the unwavering strength of the human spirit in the bustling streets of London.',
        ctaText: 'Order Now',
        stats: {
            sales: '1,200+',
            rating: '4.8',
            reviews: '150+'
        }
    },
    about: {
        title: 'A Journey Through Adversity',
        lead: 'Within the pages of this compelling memoir, Artem recounts a journey through betrayal and injustice in the bustling streets of London.',
        text: 'Through personal trials & triumphs, Artem discovers the unwavering strength of resilience & the transformative power of forgiveness. His story is a poignant reminder that even in the face of adversity, the human spirit has the capacity to overcome and thrive.',
        features: ['A story of resilience', 'Set in London', 'Memoir & Life Lessons'],
        format: 'Paperback',
        pages: '256',
        isbn: '9798893970265',
        price: '$19.99'
    },
    excerpt: {
        text: '"The streets of London taught me more about life than any classroom ever could. In the chaos of the city, I found my purpose. In the betrayal of those I trusted, I discovered my strength."',
        chapter: 'New Beginnings'
    },
    author: {
        name: 'Artem Artemenko',
        bio: 'Artem Artemenko is a London-based author whose debut memoir "London Life: Be Good To People" captures the essence of resilience and human spirit. Through his writing, he shares powerful stories of overcoming adversity and finding strength in the most challenging circumstances.',
        bioExtended: 'Born with a passion for storytelling, Artem uses his experiences to inspire others to embrace life\'s challenges and transform them into opportunities for growth.',
        social: {
            instagram: '#',
            tiktok: '#',
            twitter: '#',
            amazon: '#'
        }
    },
    reviews: [
        {
            stars: 5,
            text: 'An incredibly moving story that stayed with me long after I finished reading. Artem\'s journey is both heartbreaking and inspiring.',
            name: 'Sarah M.',
            source: 'Amazon Review'
        },
        {
            stars: 5,
            text: 'A raw and honest account of life\'s challenges. This book reminded me that we all have the strength to overcome our darkest moments.',
            name: 'James K.',
            source: 'Goodreads'
        },
        {
            stars: 4.5,
            text: 'Beautifully written with vivid descriptions of London. Artem\'s voice is authentic and his message of forgiveness is powerful.',
            name: 'Emma L.',
            source: 'Book Blog'
        }
    ],
    buy: {
        price: '$19.99',
        links: {
            amazon: 'https://amazon.com/dp/B0XXXXXXXXX',
            barnes: '',
            direct: '',
            signed: ''
        }
    },
    newsletter: {
        title: 'Stay Connected',
        text: 'Subscribe to receive updates, exclusive content, and news about upcoming releases.'
    },
    contact: {
        email: 'contact@londonlife-book.com',
        location: 'London, United Kingdom'
    }
};

// Load CMS content
function loadCMSContent() {
    try {
        const stored = localStorage.getItem(CMS_STORAGE_KEY);
        return stored ? { ...defaultContent, ...JSON.parse(stored) } : defaultContent;
    } catch {
        return defaultContent;
    }
}

// Apply content to page
function applyContent() {
    const content = loadCMSContent();
    
    // Hero Section
    setTextContent('heroBadge', content.hero?.badge);
    setTextContent('heroTitleLine1', content.hero?.titleLine1);
    setTextContent('heroTitleLine2', content.hero?.titleLine2);
    setTextContent('heroSubtitle', content.hero?.subtitle);
    setTextContent('heroAuthor', content.hero?.author);
    setTextContent('heroDescription', content.hero?.description);
    setTextContent('heroCTAText', content.hero?.ctaText);
    setTextContent('statSales', content.hero?.stats?.sales);
    setTextContent('statRating', content.hero?.stats?.rating);
    setTextContent('statReviews', content.hero?.stats?.reviews);
    
    // About Section
    setTextContent('aboutTitle', content.about?.title);
    setTextContent('aboutLead', content.about?.lead);
    setTextContent('aboutText', content.about?.text);
    setTextContent('feature1', content.about?.features?.[0]);
    setTextContent('feature2', content.about?.features?.[1]);
    setTextContent('feature3', content.about?.features?.[2]);
    setTextContent('bookFormat', content.about?.format);
    setTextContent('bookPages', content.about?.pages);
    setTextContent('bookISBN', content.about?.isbn);
    setTextContent('bookPrice', content.about?.price);
    
    // Excerpt
    setTextContent('featuredExcerpt', content.excerpt?.text);
    setTextContent('excerptChapter', content.excerpt?.chapter);
    
    // Author Section
    setTextContent('authorSectionTitle', content.author?.name);
    setTextContent('authorBio', content.author?.bio);
    setTextContent('authorBioExtended', content.author?.bioExtended);
    setHref('authorInstagram', content.author?.social?.instagram);
    setHref('authorTiktok', content.author?.social?.tiktok);
    setHref('authorTwitter', content.author?.social?.twitter);
    setHref('authorAmazon', content.author?.social?.amazon);
    
    // Buy Section
    setTextContent('buyPrice', content.buy?.price);
    setHref('buyAmazon', content.buy?.links?.amazon);
    setHref('buyBarnes', content.buy?.links?.barnes);
    setHref('buyDirect', content.buy?.links?.direct);
    setHref('buySigned', content.buy?.links?.signed);
    
    // Newsletter
    setTextContent('newsletterTitle', content.newsletter?.title);
    setTextContent('newsletterText', content.newsletter?.text);
    
    // Contact
    setTextContent('contactEmail', content.contact?.email);
    setTextContent('contactLocation', content.contact?.location);
    
    // Footer social links
    setHref('footerInstagram', content.author?.social?.instagram);
    setHref('footerTiktok', content.author?.social?.tiktok);
    setHref('footerTwitter', content.author?.social?.twitter);
    setHref('footerAmazon', content.author?.social?.amazon);
    
    // Hide empty buy buttons
    hideEmptyLinks();
    
    // Apply reviews
    if (content.reviews && content.reviews.length > 0) {
        applyReviews(content.reviews);
    }
}

function setTextContent(id, text) {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
}

function setHref(id, url) {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
}

function hideEmptyLinks() {
    const buyLinks = ['buyAmazon', 'buyBarnes', 'buyDirect', 'buySigned'];
    buyLinks.forEach(id => {
        const el = document.getElementById(id);
        if (el && (!el.href || el.href === '#' || el.href === window.location.href)) {
            el.style.display = 'none';
        }
    });
}

function applyReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    if (!container || reviews.length === 0) return;
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-stars">
                ${generateStars(review.stars)}
            </div>
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">
                <span class="reviewer-name">${review.name}</span>
                <span class="review-source">${review.source}</span>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Navigation
function toggleNav() {
    document.getElementById('navMenu').classList.toggle('active');
}

// Scroll effects
function handleScroll() {
    const nav = document.getElementById('landingNav');
    const backToTop = document.getElementById('backToTop');
    
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
        backToTop.classList.add('visible');
    } else {
        nav.classList.remove('scrolled');
        backToTop.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Newsletter
function handleNewsletter(event) {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    
    // Store subscriber (in production, send to backend)
    const subscribers = JSON.parse(localStorage.getItem('londonlife_subscribers') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('londonlife_subscribers', JSON.stringify(subscribers));
    }
    
    alert('Thank you for subscribing! You\'ll receive updates about London Life.');
    document.getElementById('newsletterForm').reset();
}

// Set current year
function setCurrentYear() {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close mobile nav
                document.getElementById('navMenu').classList.remove('active');
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    applyContent();
    setCurrentYear();
    initSmoothScroll();
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
});

// Listen for CMS updates (when author updates content)
window.addEventListener('storage', function(e) {
    if (e.key === CMS_STORAGE_KEY) {
        applyContent();
    }
});

console.log('London Life Landing Page Loaded');
