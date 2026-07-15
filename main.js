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
let filterBtns = document.querySelectorAll('.filter-btn');
let portfolioItems = document.querySelectorAll('.portfolio-item');

function initPortfolioFilters() {
  filterBtns = document.querySelectorAll('.filter-btn');
  portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  // Re-fetch since we replaced the buttons
  filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
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
}
initPortfolioFilters();

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

    // Determine form action API and recipient email from CMS siteData
    const actionUrl = form.dataset.actionUrl || '';
      
    const recipientEmail = (window.siteData && window.siteData.contact && window.siteData.contact.email)
      ? window.siteData.contact.email.trim()
      : 'kontakt@paulus.digital';

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Wird gesendet…';

    if (actionUrl) {
      // 1. Live API Submission (e.g. Formspree / Web3Forms)
      try {
        const formData = new FormData(form);
        
        // Add Web3Forms helpful metadata if this is a Web3Forms submission
        if (actionUrl.includes('web3forms.com')) {
          formData.append('subject', `Neue Anfrage von ${document.getElementById('form-name').value.trim()} - paulus.digital`);
          formData.append('from_name', 'paulus.digital Kontaktformular');
        }
        
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Anfrage absenden';
        
        if (response.ok) {
          showMessage('Vielen Dank! Ich habe deine Anfrage erhalten und melde mich in Kürze bei dir.', 'success');
          form.reset();
        } else {
          throw new Error('Server returned error status');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').textContent = 'Anfrage absenden';
        showMessage('Sende-Fehler. Bitte kontaktiere mich direkt per E-Mail an ' + recipientEmail, 'error');
      }
    } else {
      // 2. Safe Mailto Fallback (Never lose an inquiry)
      const name = document.getElementById('form-name').value.trim();
      const company = document.getElementById('form-company').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const message = document.getElementById('form-message').value.trim();
      
      const subject = encodeURIComponent(`Anfrage von ${name} - paulus.digital`);
      const body = encodeURIComponent(
        `Hi Paulus,\n\nhier ist eine neue Kontaktanfrage von deiner Webseite:\n\n` +
        `Name: ${name}\n` +
        `Firma/Verein: ${company || 'Keine Angabe'}\n` +
        `E-Mail: ${email}\n` +
        `Telefon: ${phone || 'Keine Angabe'}\n\n` +
        `Nachricht:\n${message}\n\n` +
        `---\nGesendet über das Kontaktformular von paulus.digital`
      );
      
      // Open default mail program
      window.open(`mailto:${recipientEmail}?subject=${subject}&body=${body}`, '_blank');
      
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Anfrage absenden';
      showMessage('E-Mail-Entwurf geöffnet. Bitte sende die Nachricht in deinem E-Mail-Programm ab!', 'success');
      form.reset();
    }
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
function init3dTilt() {
  const tiltElements = document.querySelectorAll('.service-card, .portfolio-item');
  tiltElements.forEach(el => {
    // Remove listeners first to avoid double triggers
    el.removeEventListener('mousemove', handleTiltMove);
    el.removeEventListener('mouseleave', handleTiltLeave);
    
    el.addEventListener('mousemove', handleTiltMove);
    el.addEventListener('mouseleave', handleTiltLeave);
  });
}

function handleTiltMove(e) {
  const rect = this.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rotateX = ((y / rect.height) - 0.5) * -12;
  const rotateY = ((x / rect.width) - 0.5) * 12;
  this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
}

function handleTiltLeave() {
  this.style.transform = '';
}

init3dTilt();

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

// ── Barrierefreiheit (Accessibility) Panel Toggle & Hide/Show ──
const accessBtn = document.getElementById('accessibility-toggle-btn');
const accessWidget = document.getElementById('accessibility-widget');
const btnHideWidget = document.getElementById('btn-hide-widget');
const btnShowAccessibility = document.getElementById('btn-show-accessibility');

// Check initial state from LocalStorage
if (localStorage.getItem('accessibility_widget_hidden') === 'true') {
  if (accessWidget) accessWidget.style.display = 'none';
  if (btnShowAccessibility) btnShowAccessibility.style.display = 'inline-block';
}

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

// Handler to hide the widget completely
if (btnHideWidget && accessWidget) {
  btnHideWidget.addEventListener('click', () => {
    accessWidget.classList.remove('open');
    accessWidget.style.display = 'none';
    localStorage.setItem('accessibility_widget_hidden', 'true');
    if (btnShowAccessibility) btnShowAccessibility.style.display = 'inline-block';
  });
}

// Handler to restore the widget from the footer
if (btnShowAccessibility && accessWidget) {
  btnShowAccessibility.addEventListener('click', () => {
    accessWidget.style.display = 'block';
    localStorage.removeItem('accessibility_widget_hidden');
    btnShowAccessibility.style.display = 'none';
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

// ── Apply Data to DOM (Dynamic Page Builder Core) ──
function applyDataToDom(data) {
  if (!data) return;

  // 0. Layout Reordering, Visibility & Custom Sections
  const mainContent = document.getElementById('main-content');
  if (mainContent && data.sections) {
    // Remove any previously rendered custom sections first
    document.querySelectorAll('.custom-section').forEach(el => el.remove());
    
    const defaultSectionIds = ["hero", "leistungen", "ueber-mich", "portfolio", "transparenz", "kontakt"];
    
    data.sections.forEach(sec => {
      const secId = typeof sec === 'object' ? sec.id : sec;
      const isVisible = typeof sec === 'object' ? sec.visible !== false : true;
      
      let el = document.getElementById(secId);
      
      // If it's a custom section, render it from templates
      if (!el && data.customSections) {
        const customData = data.customSections.find(c => c.id === secId);
        if (customData) {
          const template = document.getElementById('custom-section-template');
          if (template) {
            const clone = template.content.cloneNode(true);
            const sectionNode = clone.querySelector('section');
            sectionNode.id = secId;
            
            const titleNode = clone.querySelector('.section-title');
            const contentNode = clone.querySelector('.custom-section-content');
            
            if (titleNode) titleNode.innerHTML = customData.title || "";
            if (contentNode) contentNode.innerHTML = customData.content || "";
            
            mainContent.appendChild(clone);
            el = document.getElementById(secId);
          }
        }
      }
      
      if (el) {
        if (isVisible) {
          el.style.display = '';
          mainContent.appendChild(el); // Move to current position in order
        } else {
          el.style.display = 'none';
        }
      }
    });
    
    // Hide any default section not present in the layout list
    defaultSectionIds.forEach(secId => {
      const inLayout = data.sections.some(s => (typeof s === 'object' ? s.id : s) === secId);
      if (!inLayout) {
        const el = document.getElementById(secId);
        if (el) el.style.display = 'none';
      }
    });
  }

  // 1. Hero
  if (data.hero) {
    const headlineEl = document.querySelector('.hero-headline');
    const sublineEl = document.querySelector('.hero-subline');
    if (headlineEl && data.hero.headline) headlineEl.innerHTML = data.hero.headline;
    if (sublineEl && data.hero.subline) sublineEl.innerHTML = data.hero.subline;
  }

  // 2. Prices
  if (data.pricing) {
    const priceGrafik = document.querySelector('#service-grafik .price-amount');
    const priceWeb = document.querySelector('#service-web .price-amount');
    const priceReels = document.querySelector('#service-video .price-amount');
    
    if (priceGrafik && data.pricing.grafik) priceGrafik.textContent = data.pricing.grafik + ' €';
    if (priceWeb && data.pricing.web) priceWeb.textContent = data.pricing.web + ' €';
    if (priceReels && data.pricing.reels) priceReels.textContent = data.pricing.reels + ' €';
  }

  // 3. About
  if (data.about) {
    const aboutTexts = document.querySelectorAll('.about-text');
    if (aboutTexts.length >= 3) {
      if (data.about.text1) aboutTexts[0].innerHTML = data.about.text1;
      if (data.about.text2) aboutTexts[1].innerHTML = data.about.text2;
      if (data.about.text3) aboutTexts[2].innerHTML = data.about.text3;
    }
    
    // Dynamically apply portrait image filename from database
    const portraitImg = document.querySelector('.about-portrait');
    if (portraitImg && data.about.portrait) {
      portraitImg.src = data.about.portrait;
    }
  }

  // 3a. Contact Email Update
  if (data.contact && data.contact.email) {
    const email = data.contact.email.trim();
    document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
      el.href = `mailto:${email}`;
      const textSpan = el.querySelector('span');
      if (textSpan) {
        textSpan.textContent = email;
      } else if (el.textContent.includes('@')) {
        el.textContent = email;
      }
    });
  }

  // 3d. Form Action / Web3Forms Key Handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm && data.contact) {
    const hiddenKeyInput = document.getElementById('form-access-key');
    const action = data.contact.form_action ? data.contact.form_action.trim() : '';
    if (action) {
      if (action.includes('http://') || action.includes('https://')) {
        // It's a full URL (Formspree or other API endpoint)
        contactForm.dataset.actionUrl = action;
        if (hiddenKeyInput) hiddenKeyInput.remove(); // Remove key if it was there
      } else {
        // It's a Web3Forms Access Key (UUID)
        contactForm.dataset.actionUrl = 'https://api.web3forms.com/submit';
        if (hiddenKeyInput) {
          hiddenKeyInput.value = action;
        } else {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'access_key';
          input.id = 'form-access-key';
          input.value = action;
          contactForm.appendChild(input);
        }
      }
    } else {
      contactForm.removeAttribute('data-action-url');
      if (hiddenKeyInput) hiddenKeyInput.remove();
    }
  }

  // 3b. Testimonials (Carousel rendering)
  const testimonialsCarousel = document.getElementById('testimonials-carousel');
  const dotsContainer = document.getElementById('testimonials-dots');
  
  if (testimonialsCarousel && data.testimonials) {
    testimonialsCarousel.innerHTML = data.testimonials.map(item => {
      const initials = item.name.split(' ').map(n => n[0]).join('');
      const quoteText = item.text.trim() 
        ? `<p class="testimonial-text">"${item.text}"</p>` 
        : `<div class="testimonial-text-spacer" style="flex-grow: 1; min-height: 2rem;"></div>`;
      return `
        <div class="testimonial-card">
          <div class="testimonial-stars">★★★★★</div>
          ${quoteText}
          <div class="testimonial-author">
            <div class="testimonial-avatar">${initials}</div>
            <div class="testimonial-meta">
              <h4>${item.name}</h4>
              <span>${item.company}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Render Dots indicator
    if (dotsContainer) {
      const cardCount = data.testimonials.length;
      dotsContainer.innerHTML = Array.from({ length: cardCount }).map((_, idx) => {
        return `<span class="dot ${idx === 0 ? 'active' : ''}" onclick="scrollToTestimonial(${idx})"></span>`;
      }).join('');
    }

    // Scroll listener on carousel to sync dots active state
    testimonialsCarousel.addEventListener('scroll', () => {
      const scrollPos = testimonialsCarousel.scrollLeft;
      const firstCard = testimonialsCarousel.querySelector('.testimonial-card');
      if (!firstCard) return;
      const cardWidth = firstCard.offsetWidth + 24; // width + gap
      const activeIdx = Math.round(scrollPos / cardWidth);
      
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    });
  }

  // 3c. FAQs
  const faqAccordion = document.getElementById('faq-accordion');
  if (faqAccordion && data.faqs) {
    faqAccordion.innerHTML = data.faqs.map((item, idx) => {
      return `
        <div class="faq-item" id="faq-item-${idx}">
          <button class="faq-trigger" onclick="toggleFaq(${idx})">
            <span>${item.question}</span>
            <span class="faq-icon">+</span>
          </button>
          <div class="faq-panel" id="faq-panel-${idx}">
            <p>${item.answer}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Portfolio
  const grid = document.getElementById('portfolio-grid');
  if (grid && data.portfolio && data.portfolio.length > 0) {
    // Keep a global reference to the portfolio data for the lightbox
    window.currentPortfolioData = data.portfolio;
    
    grid.innerHTML = data.portfolio.map((item, index) => {
      const isSvg = !item.image && !item.video;
      let bgStyle = '';
      let svgIcon = '';
      let catLabel = '';
      
      if (item.category === 'grafik') {
        bgStyle = 'background: linear-gradient(135deg, #f0f4ff 0%, #dde8ff 100%);';
        catLabel = 'Grafik & Print';
        svgIcon = `
          <svg viewBox="0 0 80 60" class="portfolio-thumb-icon" aria-hidden="true">
            <rect x="8" y="8" width="64" height="44" rx="2" fill="none" stroke="#2563eb" stroke-width="1.5"/>
            <rect x="16" y="16" width="48" height="8" rx="1" fill="#2563eb" opacity="0.2"/>
            <rect x="16" y="28" width="20" height="16" rx="2" fill="#2563eb" opacity="0.15"/>
            <rect x="40" y="28" width="24" height="7" rx="1" fill="#2563eb" opacity="0.15"/>
            <rect x="40" y="38" width="18" height="6" rx="1" fill="#2563eb" opacity="0.12"/>
          </svg>
        `;
      } else if (item.category === 'web') {
        bgStyle = 'background: linear-gradient(135deg, #e8f4f8 0%, #c8e6f0 100%);';
        catLabel = 'Webdesign';
        svgIcon = `
          <svg viewBox="0 0 80 60" class="portfolio-thumb-icon" aria-hidden="true">
            <rect x="5" y="5" width="70" height="50" rx="4" fill="none" stroke="#0b7a8a" stroke-width="1.5"/>
            <path d="M5 15h70" stroke="#0b7a8a" stroke-width="1.5"/>
            <circle cx="11" cy="10" r="2" fill="#0b7a8a" opacity="0.4"/>
            <circle cx="18" cy="10" r="2" fill="#0b7a8a" opacity="0.4"/>
            <circle cx="25" cy="10" r="2" fill="#0b7a8a" opacity="0.4"/>
            <rect x="15" y="22" width="30" height="4" rx="2" fill="#0b7a8a" opacity="0.3"/>
            <rect x="15" y="30" width="50" height="2" rx="1" fill="#0b7a8a" opacity="0.2"/>
            <rect x="15" y="35" width="45" height="2" rx="1" fill="#0b7a8a" opacity="0.2"/>
            <rect x="15" y="40" width="40" height="2" rx="1" fill="#0b7a8a" opacity="0.2"/>
          </svg>
        `;
      } else {
        bgStyle = 'background: linear-gradient(135deg, #f5f0ff 0%, #e4d8ff 100%);';
        catLabel = 'Reels & Video';
        svgIcon = `
          <svg viewBox="0 0 80 60" class="portfolio-thumb-icon" aria-hidden="true">
            <rect x="22" y="4" width="36" height="52" rx="6" fill="none" stroke="#7c3aed" stroke-width="1.5"/>
            <rect x="26" y="10" width="28" height="30" rx="2" fill="#7c3aed" opacity="0.12"/>
            <circle cx="40" cy="25" r="8" fill="none" stroke="#7c3aed" stroke-width="1.5"/>
            <path d="M37 25l5-3v6l-5-3z" fill="#7c3aed"/>
            <rect x="30" y="45" width="20" height="3" rx="1.5" fill="#7c3aed" opacity="0.3"/>
          </svg>
        `;
      }
      
      const isLink = !!item.url;
      const externalLinkHtml = isLink ? `<a href="${item.url}" target="_blank" rel="noopener" class="portfolio-external-link" onclick="event.stopPropagation()">Zur Webseite &rarr;</a>` : '';
      
      let imageSrc = item.image;
      let thumbHtml = '';
      
      if (item.video) {
        // Render 3D phone mockup playing the client video screencast
        thumbHtml = `
          <div class="phone-mockup-3d">
            <div class="phone-case">
              <div class="phone-speaker"></div>
              <div class="phone-screen">
                <video class="phone-video" autoplay loop muted playsinline>
                  <source src="${item.video}" type="video/mp4">
                </video>
              </div>
              <div class="phone-home-btn"></div>
            </div>
          </div>
        `;
      } else if (item.category === 'grafik' && item.image) {
        // Render 3D paper flyer mockup
        thumbHtml = `
          <div class="paper-mockup-3d">
            <div class="paper-sheet">
              <img class="paper-img" src="${imageSrc}" alt="${item.title}" loading="lazy" />
            </div>
          </div>
        `;
      } else if (isSvg) {
        thumbHtml = `<div class="portfolio-thumb-bg" style="${bgStyle}">${svgIcon}</div>`;
      } else {
        thumbHtml = `<img class="portfolio-thumb-img" src="${imageSrc}" alt="${item.title}" loading="lazy" />`;
      }
        
      return `
        <div class="portfolio-item" data-category="${item.category}" id="portfolio-${index}" onclick="openPortfolioLightbox(${index})">
          <div class="portfolio-thumb">
            ${thumbHtml}
            <div class="portfolio-info">
              <span class="portfolio-category-tag">${catLabel}</span>
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
              ${externalLinkHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    initPortfolioFilters();
    init3dTilt();
  }
}

// ── Portfolio Lightbox Modal Control ──
window.openPortfolioLightbox = function(index) {
  const portfolio = window.currentPortfolioData;
  if (!portfolio || !portfolio[index]) return;
  const item = portfolio[index];
  
  const modal = document.getElementById('portfolio-modal');
  const visualContainer = document.getElementById('portfolio-modal-visual');
  const tagEl = document.getElementById('portfolio-modal-tag');
  const titleEl = document.getElementById('portfolio-modal-title');
  const descEl = document.getElementById('portfolio-modal-desc');
  const actionContainer = document.getElementById('portfolio-modal-action-container');
  
  if (!modal || !visualContainer) return;
  
  // Fill details text
  let catLabel = 'Projekt';
  if (item.category === 'grafik') catLabel = 'Grafik & Print';
  if (item.category === 'web') catLabel = 'Webdesign';
  if (item.category === 'video') catLabel = 'Reels & Video';
  
  tagEl.textContent = catLabel;
  titleEl.textContent = item.title;
  descEl.textContent = item.desc;
  
  // Fill external action link
  if (item.url) {
    actionContainer.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener" class="btn btn-primary">Zur Webseite</a>`;
  } else {
    actionContainer.innerHTML = '';
  }
  
  // Fill visual content
  visualContainer.innerHTML = '';
  
  if (item.video) {
    // Phone screen video player inside a vergrößerten 3D-Smartphone-Gehäuse
    visualContainer.innerHTML = `
      <div class="phone-case phone-case-modal">
        <div class="phone-speaker"></div>
        <div class="phone-screen">
          <video class="phone-video" controls autoplay loop playsinline style="object-fit: cover; width: 100%; height: 100%;">
            <source src="${item.video}" type="video/mp4">
          </video>
        </div>
        <div class="phone-home-btn"></div>
      </div>
    `;
  } else if (item.category === 'grafik' && item.image) {
    // 3D Interactive Flyer Configurator
    const backImage = item.image_back || item.image;
    visualContainer.innerHTML = `
      <div class="configurator-container">
        <span class="configurator-hint">Klicke und ziehe zum Drehen (3D)</span>
        <div class="configurator-viewport" id="cfg-viewport">
          <div class="configurator-paper" id="cfg-paper">
            <div class="configurator-face front">
              <img src="${item.image}" alt="Vorderseite" />
            </div>
            <div class="configurator-face back">
              <img src="${backImage}" alt="Rückseite" />
            </div>
          </div>
        </div>
        <div class="configurator-controls">
          <button class="configurator-btn" id="cfg-btn-flip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: scaleX(-1);"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            Wenden
          </button>
          <button class="configurator-btn" id="cfg-btn-zoom-in">Zoom +</button>
          <button class="configurator-btn" id="cfg-btn-zoom-out">Zoom -</button>
          <button class="configurator-btn" id="cfg-btn-reset">Zurücksetzen</button>
        </div>
      </div>
    `;
    setTimeout(() => init3dFlyerConfigurator(), 50);
  } else if (item.image) {
    // High-res regular image
    visualContainer.innerHTML = `<img class="portfolio-modal-img" src="${item.image}" alt="${item.title}" />`;
  } else {
    // Fallback
    visualContainer.innerHTML = `<div class="portfolio-thumb-bg" style="width:100%; height:300px; display:flex; align-items:center; justify-content:center; background:#e2e8f0; border-radius:var(--radius);">Keine Vorschau verfügbar</div>`;
  }
  
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Lock scroll
};

window.closePortfolioLightbox = function() {
  const modal = document.getElementById('portfolio-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Unlock scroll
  
  // Stop playing video if exists
  const video = modal.querySelector('video');
  if (video) {
    video.pause();
    video.src = '';
    video.load();
  }
};

// Wire closing handlers
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('portfolio-modal-close');
  const modal = document.getElementById('portfolio-modal');
  if (closeBtn) closeBtn.addEventListener('click', window.closePortfolioLightbox);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closePortfolioLightbox();
    });
  }
});

// ── 3D Interactive Flyer Configurator Engine ──
function init3dFlyerConfigurator() {
  const paper = document.getElementById('cfg-paper');
  const viewport = document.getElementById('cfg-viewport');
  const btnFlip = document.getElementById('cfg-btn-flip');
  const btnZoomIn = document.getElementById('cfg-btn-zoom-in');
  const btnZoomOut = document.getElementById('cfg-btn-zoom-out');
  const btnReset = document.getElementById('cfg-btn-reset');
  
  if (!paper || !viewport) return;
  
  let isDragging = false;
  let startX = 0, startY = 0;
  let rotX = 15;  // Default angle X
  let rotY = -20; // Default angle Y
  let zoom = 1.0;
  let isFlipped = false;
  
  const updateTransform = (animate = false) => {
    if (animate) {
      paper.classList.add('animating');
      setTimeout(() => paper.classList.remove('animating'), 600);
    }
    const currentY = rotY + (isFlipped ? 180 : 0);
    paper.style.transform = `scale(${zoom}) rotateX(${rotX}deg) rotateY(${currentY}deg)`;
  };
  
  // Apply initial default transforms
  updateTransform(true);
  
  // Start dragging
  const onStart = (e) => {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX);
    startY = e.clientY || (e.touches && e.touches[0].clientY);
  };
  
  // Moving while dragging
  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;
    
    const deltaX = clientX - startX;
    const deltaY = clientY - startY;
    
    const sensitivity = 0.6;
    rotY += deltaX * sensitivity;
    rotX -= deltaY * sensitivity;
    
    // Bound X to prevent vertical flipping loops
    rotX = Math.max(-75, Math.min(75, rotX));
    
    startX = clientX;
    startY = clientY;
    
    updateTransform();
  };
  
  // Stop dragging
  const onEnd = () => {
    isDragging = false;
  };
  
  // Attach events
  viewport.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  
  viewport.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
  
  // Wire up control buttons
  if (btnFlip) {
    btnFlip.addEventListener('click', () => {
      isFlipped = !isFlipped;
      updateTransform(true);
    });
  }
  
  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      zoom = Math.min(2.0, zoom + 0.15);
      updateTransform(true);
    });
  }
  
  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      zoom = Math.max(0.6, zoom - 0.15);
      updateTransform(true);
    });
  }
  
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      rotX = 15;
      rotY = -20;
      zoom = 1.0;
      isFlipped = false;
      updateTransform(true);
    });
  }
}

// ── Dynamic Content Loader (JSON Fetch from CMS) ──
async function loadDynamicContent() {
  try {
    const response = await fetch('/content/home.json');
    if (!response.ok) return;
    const data = await response.json();
    window.siteData = data;
    applyDataToDom(data);
  } catch (err) {
    console.error('Fehler beim Laden der Inhalte:', err);
  }
}

// ── FAQ Accordion Toggle ──
window.toggleFaq = function(idx) {
  const item = document.getElementById(`faq-item-${idx}`);
  const panel = document.getElementById(`faq-panel-${idx}`);
  if (!item || !panel) return;
  
  const isActive = item.classList.contains('active');
  
  // Close all other FAQs
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.faq-panel').forEach(el => el.style.maxHeight = null);
  
  if (!isActive) {
    item.classList.add('active');
    panel.style.maxHeight = panel.scrollHeight + "px";
  }
};

// ── Project Configurator Logic ──
function initProjectConfigurator() {
  const services = document.querySelectorAll('#cfg-services .cfg-chip');
  const timelines = document.querySelectorAll('#cfg-timelines .cfg-chip');
  const budgetContainer = document.querySelector('#cfg-budgets');
  
  // Define budget options for each service category matching actual pricing tiers
  const BUDGET_OPTIONS = {
    grafik: [
      { label: "Unter 150 €", value: "Unter 150 €" },
      { label: "150 € - 450 €", value: "150 € - 450 €", active: true },
      { label: "Über 450 €", value: "Über 450 €" }
    ],
    web: [
      { label: "Unter 500 €", value: "Unter 500 €" },
      { label: "500 € - 1.200 €", value: "500 € - 1.200 €", active: true },
      { label: "Über 1.200 €", value: "Über 1.200 €" }
    ],
    video: [
      { label: "Unter 300 €", value: "Unter 300 €" },
      { label: "300 € - 800 €", value: "300 € - 800 €", active: true },
      { label: "Über 800 €", value: "Über 800 €" }
    ],
    default: [
      { label: "Unter 500 €", value: "Unter 500 €" },
      { label: "500 € - 1.500 €", value: "500 € - 1.500 €", active: true },
      { label: "Über 1.500 €", value: "Über 1.500 €" }
    ]
  };

  const renderBudgets = () => {
    if (!budgetContainer) return;
    
    // Check which services are currently active
    const activeServices = [];
    document.querySelectorAll('#cfg-services .cfg-chip.active').forEach(el => {
      activeServices.push(el.dataset.value);
    });

    let currentBudgets = BUDGET_OPTIONS.default;
    
    // If exactly one category is selected, load its specific budget options
    if (activeServices.length === 1) {
      const cat = activeServices[0];
      if (BUDGET_OPTIONS[cat]) {
        currentBudgets = BUDGET_OPTIONS[cat];
      }
    } else if (activeServices.length > 1) {
      // If a combination is selected, calculate a combined budget range
      if (activeServices.includes('web')) {
        currentBudgets = [
          { label: "Unter 1.000 €", value: "Unter 1.000 €" },
          { label: "1.000 € - 2.500 €", value: "1.000 € - 2.500 €", active: true },
          { label: "Über 2.500 €", value: "Über 2.500 €" }
        ];
      } else {
        // Combination of print & video
        currentBudgets = [
          { label: "Unter 500 €", value: "Unter 500 €" },
          { label: "500 € - 1.200 €", value: "500 € - 1.200 €", active: true },
          { label: "Über 1.200 €", value: "Über 1.200 €" }
        ];
      }
    }

    // Remember previously selected budget value to try and keep it active
    const previousActive = document.querySelector('#cfg-budgets .cfg-chip.active');
    const prevValue = previousActive ? previousActive.dataset.value : null;

    budgetContainer.innerHTML = currentBudgets.map(item => {
      const isActive = prevValue 
        ? (item.value === prevValue) 
        : item.active;
      return `<div class="cfg-chip ${isActive ? 'active' : ''}" data-value="${item.value}">${item.label}</div>`;
    }).join('');

    // If no chip was marked active (because previous value didn't match), default to first one
    if (!budgetContainer.querySelector('.cfg-chip.active')) {
      const firstChip = budgetContainer.querySelector('.cfg-chip');
      if (firstChip) firstChip.classList.add('active');
    }

    // Re-bind click events on newly rendered budget chips
    budgetContainer.querySelectorAll('.cfg-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        budgetContainer.querySelectorAll('.cfg-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateConfiguratorText();
      });
    });
  };
  
  const updateConfiguratorText = () => {
    const selectedServices = [];
    document.querySelectorAll('#cfg-services .cfg-chip.active').forEach(el => {
      selectedServices.push(el.querySelector('span:last-child').textContent.trim());
    });
    
    const timelineChip = document.querySelector('#cfg-timelines .cfg-chip.active');
    const timeline = timelineChip ? timelineChip.dataset.value : 'Normal';
    
    const budgetChip = document.querySelector('#cfg-budgets .cfg-chip.active');
    const budget = budgetChip ? budgetChip.dataset.value : '500 € - 1.500 €';
    
    const messageArea = document.getElementById('form-message');
    if (!messageArea) return;
    
    if (selectedServices.length === 0) {
      messageArea.value = '';
      return;
    }
    
    const servicesText = selectedServices.length === 1 
      ? `im Bereich ${selectedServices[0]}` 
      : `in den Bereichen ${selectedServices.slice(0, -1).join(', ')} und ${selectedServices[selectedServices.length - 1]}`;
      
    messageArea.value = `Hi Paulus, ich interessiere mich für eine Zusammenarbeit ${servicesText}.\n\nMein geplanter Zeitrahmen: ${timeline}\nMein geschätzter Budget-Rahmen: ${budget}\n\nLass uns gerne unverbindlich darüber sprechen!`;
    
    // Also sync the hidden legacy dropdown value for form compatibility
    const legacySelect = document.getElementById('form-leistung');
    if (legacySelect) {
      if (selectedServices.length === 1) {
        if (selectedServices[0].includes('Grafik')) legacySelect.value = 'grafik';
        else if (selectedServices[0].includes('Web')) legacySelect.value = 'web';
        else if (selectedServices[0].includes('Reel')) legacySelect.value = 'video';
      } else if (selectedServices.length > 1) {
        legacySelect.value = 'kombination';
      } else {
        legacySelect.value = '';
      }
    }
  };
  
  // Wire up events
  services.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      renderBudgets();
      updateConfiguratorText();
    });
  });
  
  timelines.forEach(chip => {
    chip.addEventListener('click', () => {
      timelines.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateConfiguratorText();
    });
  });

  // Initial render of budget chips
  renderBudgets();
}

// ── Live Preview Message Listener (updates preview in iframe instantly) ──
// ── Testimonials Carousel Controls ──
window.scrollTestimonials = function(direction) {
  const carousel = document.getElementById('testimonials-carousel');
  if (!carousel) return;
  const firstCard = carousel.querySelector('.testimonial-card');
  if (!firstCard) return;
  const cardWidth = firstCard.offsetWidth + 24; // width + gap
  carousel.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
};

window.scrollToTestimonial = function(idx) {
  const carousel = document.getElementById('testimonials-carousel');
  if (!carousel) return;
  const firstCard = carousel.querySelector('.testimonial-card');
  if (!firstCard) return;
  const cardWidth = firstCard.offsetWidth + 24; // width + gap
  carousel.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
};

// ── Write Review Modal Controls ──
window.openReviewModal = function() {
  const modal = document.getElementById('review-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  // Reset review form and success msg
  const formContainer = document.getElementById('review-modal-form-container');
  const successMsg = document.getElementById('review-success-msg');
  if (formContainer) formContainer.style.display = 'block';
  if (successMsg) successMsg.style.display = 'none';
  
  const form = document.getElementById('review-submit-form');
  if (form) form.reset();
  
  setRatingStars(5); // default 5 stars
};

window.closeReviewModal = function() {
  const modal = document.getElementById('review-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// ── Rating Stars Selection ──
function initReviewStars() {
  const stars = document.querySelectorAll('#review-stars-select .star-select');
  const ratingInput = document.getElementById('review-star-value');
  if (!ratingInput) return;
  
  window.setRatingStars = function(val) {
    ratingInput.value = val;
    stars.forEach(star => {
      const starVal = parseInt(star.dataset.star, 10);
      if (starVal <= val) {
        star.classList.add('gold');
      } else {
        star.classList.remove('gold');
      }
    });
  };
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.star, 10);
      setRatingStars(val);
    });
    
    star.addEventListener('mouseenter', () => {
      const val = parseInt(star.dataset.star, 10);
      stars.forEach(s => {
        const sVal = parseInt(s.dataset.star, 10);
        if (sVal <= val) {
          s.style.color = '#fbbf24'; // hover gold
        } else {
          s.style.color = '#ddd';
        }
      });
    });
  });
  
  const starContainer = document.getElementById('review-stars-select');
  if (starContainer) {
    starContainer.addEventListener('mouseleave', () => {
      const currentVal = parseInt(ratingInput.value, 10);
      stars.forEach(s => {
        s.style.color = '';
      });
      setRatingStars(currentVal);
    });
  }
}

// ── Submit Review (Mail Draft Generator) ──
function initReviewSubmit() {
  const form = document.getElementById('review-submit-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const starsVal = document.getElementById('review-star-value').value;
    const nameVal = document.getElementById('review-name').value.trim();
    const companyVal = document.getElementById('review-company').value.trim();
    const textVal = document.getElementById('review-text').value.trim();
    
    if (!nameVal) return alert('Bitte trage deinen Namen ein.');
    
    // Construct email draft
    const subject = encodeURIComponent("Neue Bewertung für paulus.digital");
    const body = encodeURIComponent(
      `Hi Paulus,\n\nhier ist eine neue Bewertung für deine Webseite:\n\n` +
      `Name: ${nameVal}\n` +
      `Firma/Verein/Gemeinde: ${companyVal || 'Keine Angabe'}\n` +
      `Bewertung: ${starsVal} von 5 Sternen\n` +
      `Text:\n"${textVal || 'Kein Text hinterlassen'}"\n\n` +
      `Du kannst diese Bewertung im Backend unter paulus.digital/admin hinzufügen.`
    );
    
    // Open user mail client in background
    window.open(`mailto:kontakt@paulus.digital?subject=${subject}&body=${body}`);
    
    // Show success view inside modal
    const formContainer = document.getElementById('review-modal-form-container');
    const successMsg = document.getElementById('review-success-msg');
    if (formContainer) formContainer.style.display = 'none';
    if (successMsg) successMsg.style.display = 'block';
  });
}

// ── Services Carousel Nudge Logic (Mobile UX) ──
function initServicesCarousel() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  // Use Intersection Observer to nudge the carousel once when it enters the viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add animation class
        grid.classList.add('nudge-active');
        
        // Remove class after animation finishes so it doesn't lock scroll transitions
        setTimeout(() => {
          grid.classList.remove('nudge-active');
        }, 1400);
        
        // Only trigger once
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(grid);
}

// ── Live Preview Message Listener ──
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CMS_PREVIEW_UPDATE') {
    applyDataToDom(event.data.data);
  }
});

// Load dynamic content, init configurator, and review events on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadDynamicContent();
  initProjectConfigurator();
  initReviewStars();
  initReviewSubmit();
  initServicesCarousel();
});

