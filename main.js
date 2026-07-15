/* =========================================
   paulus.digital – main.js
   Interactivity & Animations
   ========================================= */

'use strict';

// ── Footer year ──
document.getElementById('footer-year').textContent = new Date().getFullYear();

// ── Nav: scroll behaviour ──
const navHeader = document.getElementById('nav-header');
const onScroll = () => {
  navHeader.classList.toggle('scrolled', window.scrollY > 20);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Nav: burger toggle ──
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// ── Smooth scroll for anchors ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height') || '72', 10);
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Intersection Observer: scroll animations ──
const animateEls = document.querySelectorAll('[data-animate]');
if (animateEls.length) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  animateEls.forEach(el => observer.observe(el));
}

// ── Auto-add data-animate to key sections ──
const animateSections = [
  '.hero-badge', '.hero-headline', '.hero-subline', '.hero-actions', '.hero-stats',
  '.service-card', '.about-image-col', '.about-content-col',
  '.portfolio-item', '.transparenz-content', '.transparenz-visual',
  '.kontakt-info', '.kontakt-form',
  '.quote-card', '.process-step'
];

animateSections.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.setAttribute('data-animate', '');
    if (i > 0) el.setAttribute('data-animate-delay', Math.min(i, 3));
  });
});

// Re-observe newly attributed elements
const allAnimated = document.querySelectorAll('[data-animate]');
if (typeof IntersectionObserver !== 'undefined') {
  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );
  allAnimated.forEach(el => obs.observe(el));
}

// ── Portfolio filter ──
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      const cat = item.dataset.category;
      const show = filter === 'all' || cat === filter;
      item.classList.toggle('hidden', !show);
    });
  });
});

// ── Contact form ──
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');
const submitBtn = document.getElementById('form-submit');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      field.classList.remove('error');
      const isEmpty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
      if (isEmpty) {
        field.classList.add('error');
        valid = false;
      }
    });

    // Email format validation
    const emailField = document.getElementById('form-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField && emailField.value && !emailRegex.test(emailField.value)) {
      emailField.classList.add('error');
      valid = false;
    }

    if (!valid) {
      showMessage('Bitte füllen Sie alle Pflichtfelder korrekt aus.', 'error');
      return;
    }

    // Simulate sending (in production: replace with fetch to backend/formspree)
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Wird gesendet…';

    await new Promise(r => setTimeout(r, 1200));

    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Anfrage absenden';
    showMessage('Vielen Dank! Ich melde mich persönlich bei Ihnen – in der Regel innerhalb von 24 Stunden.', 'success');
    form.reset();
  });

  // Remove error on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
    field.addEventListener('change', () => field.classList.remove('error'));
  });
}

function showMessage(text, type) {
  successMsg.textContent = text;
  successMsg.className = 'form-success';
  successMsg.classList.add(type === 'success' ? 'show-success' : 'show-error');
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (type === 'success') {
    setTimeout(() => {
      successMsg.className = 'form-success';
    }, 8000);
  }
}

// ── Active nav highlight on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = 'var(--color-petrol)';
          }
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

// ── Subtle parallax on hero ──
const heroBg = document.querySelector('.hero-bg-image');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });
}

// ── Interactive Hero Mouse Aura (Spotlight) ──
const heroSection = document.querySelector('.hero');
if (heroSection) {
  heroSection.addEventListener('mousemove', e => {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set custom CSS variables for positioning the gradient
    heroSection.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    heroSection.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  });
}

// ── 3D Card Hover Tilt Effect ──
const tiltElements = document.querySelectorAll('.service-card, .portfolio-item');
tiltElements.forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position inside element
    const y = e.clientY - rect.top;  // y position inside element
    
    // Calculate rotation angles based on mouse position relative to center of element
    const rotateX = ((y / rect.height) - 0.5) * -12; // max 6 deg
    const rotateY = ((x / rect.width) - 0.5) * 12;   // max 6 deg
    
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });
  
  el.addEventListener('mouseleave', () => {
    el.style.transform = ''; // reset on leave
  });
});

// ── Modals: Impressum & Datenschutz ──
const modalOverlay = document.getElementById('modal-overlay');
const btnImpressum = document.getElementById('btn-impressum');
const btnDatenschutz = document.getElementById('btn-datenschutz');
const modalClose = document.getElementById('modal-close');
const contentImpressum = document.getElementById('content-impressum');
const contentDatenschutz = document.getElementById('content-datenschutz');

const openModal = (type) => {
  if (!modalOverlay) return;
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock scroll
  
  if (type === 'impressum') {
    contentImpressum.classList.add('active');
    contentDatenschutz.classList.remove('active');
  } else {
    contentDatenschutz.classList.add('active');
    contentImpressum.classList.remove('active');
  }
};

const closeModal = () => {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Unlock scroll
  
  setTimeout(() => {
    contentImpressum.classList.remove('active');
    contentDatenschutz.classList.remove('active');
  }, 300);
};

if (btnImpressum) btnImpressum.addEventListener('click', () => openModal('impressum'));
if (btnDatenschutz) btnDatenschutz.addEventListener('click', () => openModal('datenschutz'));
if (modalClose) modalClose.addEventListener('click', closeModal);

// Close modal on click outside
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
}

// Close on Escape key
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
    closeModal();
  }
});

// ── Barrierefreiheit (Accessibility) Panel Toggle ──
const accessBtn = document.getElementById('accessibility-toggle-btn');
const accessWidget = document.getElementById('accessibility-widget');

if (accessBtn && accessWidget) {
  accessBtn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = accessWidget.classList.toggle('open');
    accessBtn.setAttribute('aria-expanded', isOpen);
  });
  
  // Close accessibility panel when clicking elsewhere
  document.addEventListener('click', e => {
    if (!accessWidget.contains(e.target)) {
      accessWidget.classList.remove('open');
      accessBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Accessibility Controls ──
const rootHtml = document.documentElement;

// Font size controls
const btnFontInc = document.getElementById('btn-font-inc');
const btnFontDec = document.getElementById('btn-font-dec');
const btnFontNormal = document.getElementById('btn-font-normal');

if (btnFontInc) {
  btnFontInc.addEventListener('click', () => {
    rootHtml.classList.remove('font-dec');
    rootHtml.classList.add('font-inc');
    setActiveButton('btn-font-inc', [btnFontInc, btnFontDec, btnFontNormal]);
  });
}
if (btnFontDec) {
  btnFontDec.addEventListener('click', () => {
    rootHtml.classList.remove('font-inc');
    rootHtml.classList.add('font-dec');
    setActiveButton('btn-font-dec', [btnFontInc, btnFontDec, btnFontNormal]);
  });
}
if (btnFontNormal) {
  btnFontNormal.addEventListener('click', () => {
    rootHtml.classList.remove('font-inc', 'font-dec');
    setActiveButton('btn-font-normal', [btnFontInc, btnFontDec, btnFontNormal]);
  });
}

// Contrast controls
const btnContrastNormal = document.getElementById('btn-contrast-normal');
const btnContrastHigh = document.getElementById('btn-contrast-high');

if (btnContrastHigh) {
  btnContrastHigh.addEventListener('click', () => {
    rootHtml.classList.add('high-contrast');
    setActiveButton('btn-contrast-high', [btnContrastNormal, btnContrastHigh]);
  });
}
if (btnContrastNormal) {
  btnContrastNormal.addEventListener('click', () => {
    rootHtml.classList.remove('high-contrast');
    setActiveButton('btn-contrast-normal', [btnContrastNormal, btnContrastHigh]);
  });
}

// Highlight links control
const btnHighlightLinks = document.getElementById('btn-highlight-links');
if (btnHighlightLinks) {
  btnHighlightLinks.addEventListener('click', () => {
    const active = rootHtml.classList.toggle('highlight-links');
    btnHighlightLinks.classList.toggle('active', active);
    btnHighlightLinks.textContent = active ? 'Aktiv' : 'Inaktiv';
  });
}

// Helper: toggle active button styling
function setActiveButton(activeId, btnList) {
  btnList.forEach(btn => {
    if (btn) btn.classList.toggle('active', btn.id === activeId);
  });
}

// Reset all accessibility settings
const btnReset = document.getElementById('accessibility-reset');
if (btnReset) {
  btnReset.addEventListener('click', () => {
    rootHtml.classList.remove('font-inc', 'font-dec', 'high-contrast', 'highlight-links');
    
    // Reset UI button states
    setActiveButton('btn-font-normal', [btnFontInc, btnFontDec, btnFontNormal]);
    setActiveButton('btn-contrast-normal', [btnContrastNormal, btnContrastHigh]);
    
    if (btnHighlightLinks) {
      btnHighlightLinks.classList.remove('active');
      btnHighlightLinks.textContent = 'Inaktiv';
    }
  });
}

// ── Interactive Digital Network Canvas Animation in Hero ──
const canvas = document.getElementById('hero-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let isVisible = true;
  
  // Settings
  const particleCount = 45;
  const connectionDistance = 140;
  const mouseConnectionDistance = 180;
  
  let particles = [];
  let mouse = { x: null, y: null };
  
  let lastWidth = window.innerWidth;
  
  // Resize handler
  const resizeCanvas = () => {
    const currentWidth = window.innerWidth;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Only re-initialize particles if width actually changed (rotation / window resize)
    if (currentWidth !== lastWidth || particles.length === 0) {
      initParticles();
      lastWidth = currentWidth;
    }
  };
  
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.45; // Slow movement
      this.vy = (Math.random() - 0.5) * 0.45;
      this.radius = Math.random() * 2 + 1.5;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Bounce off walls
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(11, 122, 138, 0.25)';
      ctx.fill();
    }
  }
  
  const initParticles = () => {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  };
  
  // Tracking mouse inside hero
  const parentHero = canvas.parentElement;
  parentHero.addEventListener('mousemove', e => {
    const rect = parentHero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  
  parentHero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  
  // Draw connection lines
  const drawConnections = () => {
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      
      // Node to Mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = p1.x - mouse.x;
        const dy = p1.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouseConnectionDistance) {
          const alpha = (1 - (dist / mouseConnectionDistance)) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(11, 122, 138, ${alpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
      
      // Node to Node
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          const alpha = (1 - (dist / connectionDistance)) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(11, 122, 138, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  };
  
  // Render Loop
  const animate = () => {
    if (!isVisible) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    drawConnections();
    
    animationId = requestAnimationFrame(animate);
  };
  
  // Start/Stop based on visibility (Intersection Observer for battery/performance!)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          if (!animationId) animate();
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, { threshold: 0.05 });
    
    observer.observe(parentHero);
  } else {
    animate();
  }
  
  // Listeners
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

