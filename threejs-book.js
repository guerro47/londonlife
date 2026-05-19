// London Life — Three.js WebGL 3D Book
// Renders an interactive 3D book in the hero section

import * as THREE from 'three';

function initThreeJsBook() {
    const canvas = document.getElementById('bookCanvas');
    if (!canvas) return;

    const container = canvas.parentElement;
    const W = 380;
    const H = 520;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x080808, 10, 25);

    // Camera
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ── Book Geometry ──────────────────────────────────────────
    const BOOK_W = 2.1;
    const BOOK_H = 3.1;
    const BOOK_D = 0.32;

    const bookGeo = new THREE.BoxGeometry(BOOK_W, BOOK_H, BOOK_D, 1, 1, 1);

    // ── Textures ───────────────────────────────────────────────
    const loader = new THREE.TextureLoader();

    // Cover texture from existing project image
    const coverTex = loader.load('IMG_1218.jpeg', (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });

    // Generate a pages texture (cream/aged paper colour)
    const pagesCanvas = document.createElement('canvas');
    pagesCanvas.width = 64;
    pagesCanvas.height = 256;
    const pCtx = pagesCanvas.getContext('2d');
    const pGrad = pCtx.createLinearGradient(0, 0, 64, 0);
    pGrad.addColorStop(0,    '#e8dfc8');
    pGrad.addColorStop(0.3,  '#f0e8d4');
    pGrad.addColorStop(0.7,  '#ece4cc');
    pGrad.addColorStop(1,    '#d8ceb8');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 256);
    // subtle page lines
    pCtx.strokeStyle = 'rgba(0,0,0,0.04)';
    pCtx.lineWidth = 1;
    for (let y = 0; y < 256; y += 4) {
        pCtx.beginPath(); pCtx.moveTo(0, y); pCtx.lineTo(64, y); pCtx.stroke();
    }
    const pagesTex = new THREE.CanvasTexture(pagesCanvas);

    // Generate a spine texture (dark leather gradient)
    const spineCanvas = document.createElement('canvas');
    spineCanvas.width = 32;
    spineCanvas.height = 256;
    const sCtx = spineCanvas.getContext('2d');
    const sGrad = sCtx.createLinearGradient(0, 0, 32, 0);
    sGrad.addColorStop(0,   '#0c0a07');
    sGrad.addColorStop(0.5, '#1e1810');
    sGrad.addColorStop(1,   '#0c0a07');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 32, 256);
    const spineTex = new THREE.CanvasTexture(spineCanvas);

    // Back cover (dark, slight texture)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = 256;
    backCanvas.height = 384;
    const bCtx = backCanvas.getContext('2d');
    bCtx.fillStyle = '#12100a';
    bCtx.fillRect(0, 0, 256, 384);
    // subtle linen grain
    for (let i = 0; i < 3000; i++) {
        bCtx.fillStyle = `rgba(200,169,110,${Math.random() * 0.03})`;
        bCtx.fillRect(Math.random() * 256, Math.random() * 384, 1, 1);
    }
    const backTex = new THREE.CanvasTexture(backCanvas);

    // ── Materials ──────────────────────────────────────────────
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z (front/cover), -Z (back)
    const spineR = new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.85, metalness: 0.05 });
    const spineL = new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.85, metalness: 0.05 });
    const pagesT = new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.5 });
    const pagesB = new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.5 });
    const cover  = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.35, metalness: 0.08 });
    const back   = new THREE.MeshStandardMaterial({ map: backTex,  roughness: 0.9,  metalness: 0.02 });

    const book = new THREE.Mesh(bookGeo, [spineR, spineL, pagesT, pagesB, cover, back]);
    book.castShadow = true;
    book.rotation.y = -0.25;
    scene.add(book);

    // ── Lighting — Noir/Gold dramatic ─────────────────────────
    // Ambient (very low — noir needs drama)
    const ambient = new THREE.AmbientLight(0x0d0c0a, 1.2);
    scene.add(ambient);

    // Key light — warm golden from top-left (like a street lamp)
    const keyLight = new THREE.DirectionalLight(0xffd49b, 4.5);
    keyLight.position.set(-3.5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // Rim light — cool blue from back-right (London rainy sky)
    const rimLight = new THREE.DirectionalLight(0x6699cc, 0.9);
    rimLight.position.set(5, -1, -4);
    scene.add(rimLight);

    // Fill point — gold bounce light below
    const fillLight = new THREE.PointLight(0xc8a96e, 0.6, 12);
    fillLight.position.set(1.5, -3, 3);
    scene.add(fillLight);

    // ── Reflection plane (subtle book shadow on surface) ───────
    const planeGeo = new THREE.PlaneGeometry(8, 8);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.35, transparent: true });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -(BOOK_H / 2 + 0.01);
    plane.receiveShadow = true;
    scene.add(plane);

    // ── Interaction state ──────────────────────────────────────
    let autoRotate = true;
    let targetRotY = -0.25;
    let targetRotX = 0;
    let currentRotY = -0.25;
    let currentRotX = 0;
    let floatOffset = 0;
    let clock = new THREE.Clock();

    function lerp(a, b, t) { return a + (b - a) * t; }

    // Mouse hover: pause auto-rotate, tilt toward pointer
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        targetRotY = ((e.clientX - rect.left) / rect.width - 0.5) * -0.7;
        targetRotX = ((e.clientY - rect.top)  / rect.height - 0.5) *  0.4;
        autoRotate = false;
    });

    container.addEventListener('mouseleave', () => {
        autoRotate = true;
    });

    // Touch support
    container.addEventListener('touchmove', (e) => {
        if (!e.touches[0]) return;
        const rect = container.getBoundingClientRect();
        targetRotY = ((e.touches[0].clientX - rect.left) / rect.width - 0.5) * -0.6;
        targetRotX = ((e.touches[0].clientY - rect.top)  / rect.height - 0.5) *  0.3;
        autoRotate = false;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        autoRotate = true;
    });

    // ── Animation loop ─────────────────────────────────────────
    let animId;
    function animate() {
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        if (autoRotate) {
            // Slow cinematic rotation: -45° to +15° swing
            targetRotY = Math.sin(t * 0.25) * 0.35 - 0.15;
            targetRotX = Math.sin(t * 0.18) * 0.06;
        }

        // Smooth interpolation
        currentRotY = lerp(currentRotY, targetRotY, 0.05);
        currentRotX = lerp(currentRotX, targetRotX, 0.05);

        book.rotation.y = currentRotY;
        book.rotation.x = currentRotX;

        // Gentle float
        floatOffset = Math.sin(t * 0.6) * 0.12;
        book.position.y = floatOffset;

        // Subtle keylight flicker (noir mood)
        keyLight.intensity = 4.5 + Math.sin(t * 3.7) * 0.06;

        renderer.render(scene, camera);
    }
    animate();

    // ── Resize handling ────────────────────────────────────────
    function onResize() {
        // Keep fixed size but handle pixel ratio changes
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener('resize', onResize);

    // ── Progressive enhancement: hide fallback img ─────────────
    const fallback = document.getElementById('heroBookCover');
    if (fallback) fallback.style.display = 'none';

    // Return cleanup function
    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
    };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThreeJsBook);
} else {
    initThreeJsBook();
}
