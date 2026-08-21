// ── HAMBURGER MENU TOGGLE ──
function toggleMenu() {
  const btn = document.getElementById('menuToggle');
  const overlay = document.getElementById('menuOverlay');
  if (btn && overlay) {
    btn.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  }
}

// ── CURSOR GLOW ──
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  });
}

// ── PARTICLE SYSTEM ──
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let W = canvas.width  = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

const RED = 'rgba(255,255,255,';
const particles = [];
const NUM = 130;

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.4 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.life  = Math.random() * 200 + 100;
    this.age   = 0;
    this.shape = Math.random() < 0.15 ? 'triangle' : 'circle';
  }
  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.age++;
    if (this.age > this.life || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    const fade = this.age < 30 ? this.age / 30 : this.age > this.life - 30 ? (this.life - this.age) / 30 : 1;
    ctx.globalAlpha = this.alpha * fade;
    ctx.fillStyle   = RED + '1)';
    if (this.shape === 'triangle') {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - this.r * 2.5);
      ctx.lineTo(this.x + this.r * 2.2, this.y + this.r * 1.5);
      ctx.lineTo(this.x - this.r * 2.2, this.y + this.r * 1.5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

for (let i = 0; i < NUM; i++) particles.push(new Particle());

// background motion is disabled to match the static monochrome design
if (canvas) {
  canvas.style.display = 'none';
}

function drawLines() {
  return;
}

function animateParticles() {
  return;
}

// ── MANAGED GALLERY IMAGES ──
async function applyManagedImages() {
  if (typeof loadSharedData !== 'function') return;
  try {
    const state = await loadSharedData();
    const images = Array.isArray(state.images) ? state.images : [];
    const galleryImages = document.querySelectorAll('#gallery .gallery-card img');
    galleryImages.forEach((img, index) => {
      const item = images[index];
      if (item) {
        img.src = item.src || item.url || '';
        img.alt = item.alt || item.title || img.alt;
      }
    });

    const heroBg = document.querySelector('.hero-bg-img');
    if (heroBg && images[0]) {
      heroBg.style.backgroundImage = `url('${images[0].src || images[0].url || ''}')`;
    }

    const geometryImg = document.querySelector('#geometry .geometry-img-wrap');
    if (geometryImg && images[4]) {
      geometryImg.src = images[4].src || images[4].url || '';
      geometryImg.alt = images[4].alt || images[4].title || geometryImg.alt;
    }

    const chamberImg = document.querySelector('#chamber .chamber-img');
    if (chamberImg && images[5]) {
      chamberImg.src = images[5].src || images[5].url || '';
      chamberImg.alt = images[5].alt || images[5].title || chamberImg.alt;
    }
  } catch (error) {
    console.warn('Managed gallery images could not be loaded.', error);
  }
}
applyManagedImages();

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ── STAGGERED CARD REVEALS ──
document.querySelectorAll('.gallery-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.12}s`;
  card.classList.add('reveal');
  revealObserver.observe(card);
});
document.querySelectorAll('.symbol-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
  card.classList.add('reveal');
  revealObserver.observe(card);
});
document.querySelectorAll('.tenet-item').forEach((card, i) => {
  card.style.transitionDelay = `${i * 0.1}s`;
  card.classList.add('reveal');
  revealObserver.observe(card);
});

// ── NAV ACTIVE HIGHLIGHT ──
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) cur = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur
      ? 'rgba(255,255,255,1)' : '';
  });
});

// ── PARALLAX HERO BG ──
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-bg-img');
  if (hero) hero.style.transform = `translateY(${window.scrollY * 0.3}px)`;
});

// ── JOIN FORM SUBMISSIONS ──
function initJoinFormSubmission() {
  const form = document.getElementById('joinForm');
  if (!form) return;

  async function handleJoinFormSubmit(event) {
    event.preventDefault();
    if (form.dataset.submitting === 'true') return;
    form.dataset.submitting = 'true';

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.textContent || 'Submit';
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = i18n.t('join_submit_status');
    }

    const payload = {
      fullName: form.querySelector('#fullName')?.value.trim() || '',
      email: form.querySelector('#email')?.value.trim() || '',
      country: form.querySelector('#country')?.value.trim() || '',
      profession: form.querySelector('#profession')?.value.trim() || '',
      motivation: form.querySelector('#motivation')?.value.trim() || '',
    };

    if (!payload.fullName || !payload.email || !payload.country || !payload.motivation) {
      alert(i18n.t('join_error_required'));
      form.dataset.submitting = 'false';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
      return;
    }

    try {
      const response = await fetch(window.buildApiUrl ? window.buildApiUrl('/api/join') : '/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Submission failed.');
      }

      form.reset();
      const successMessage = document.getElementById('successMsg');
      if (successMessage) {
        successMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Join submission failed:', error);
      alert(error.message || i18n.t('join_error_failed'));
    } finally {
      form.dataset.submitting = 'false';
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
      }
    }
  }

  form.addEventListener('submit', handleJoinFormSubmit);
}

document.addEventListener('DOMContentLoaded', initJoinFormSubmission);
