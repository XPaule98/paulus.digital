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
