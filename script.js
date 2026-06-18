/* ============================================
   NovaSphere — script.js
   All interactivity: particles, cursor, scroll,
   counter, slider, filter, form
   ============================================ */

// ── GALAXY PARTICLE SYSTEM ──────────────────
(function initGalaxy() {
  const canvas = document.getElementById('galaxyCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouseX = 0, mouseY = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function () {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.r     = Math.random() * 1.5 + 0.3;
    this.speed = Math.random() * 0.3 + 0.05;
    this.angle = Math.random() * Math.PI * 2;
    this.spin  = (Math.random() - 0.5) * 0.002;
    this.alpha = Math.random() * 0.6 + 0.2;
    const palette = ['#7C3AED', '#00F5FF', '#FFD700', '#FF6B6B', '#ffffff'];
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.twinkle = Math.random() * Math.PI * 2;
  };
  Particle.prototype.update = function () {
    this.angle  += this.spin;
    this.x      += Math.cos(this.angle) * this.speed;
    this.y      += Math.sin(this.angle) * this.speed;
    this.twinkle += 0.03;
    // mouse repel
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      this.x += dx / dist * 2;
      this.y += dy / dist * 2;
    }
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };
  Particle.prototype.draw = function () {
    const a = this.alpha * (0.6 + 0.4 * Math.sin(this.twinkle));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 7000), 160);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 100) * 0.12;
          ctx.strokeStyle = '#7C3AED';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
  resize();
  initParticles();
  loop();
})();


// ── CUSTOM CURSOR ─────────────────────────────
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform  = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  function animateRing() {
    rx += (mx - rx) * 0.1;
    ry += (my - ry) * 0.1;
    ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .feature-card, .portfolio-thumb, .stat-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();


// ── NAVBAR SCROLL EFFECT ──────────────────────
(function initNavbar() {
  const nav = document.getElementById('navbar');
  const backTop = document.getElementById('backTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
      backTop.classList.add('visible');
    } else {
      nav.classList.remove('scrolled');
      backTop.classList.remove('visible');
    }
  });

  // hamburger (mobile)
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) {
        if (links.style.display === 'flex') {
          links.style.display = 'none';
        } else {
          links.style.display = 'flex';
          links.style.flexDirection = 'column';
          links.style.position = 'absolute';
          links.style.top = '70px';
          links.style.left = '0';
          links.style.right = '0';
          links.style.background = 'rgba(10,14,39,0.97)';
          links.style.padding = '1.5rem 5%';
          links.style.zIndex = '999';
          links.style.gap = '1.5rem';
          links.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        }
      }
    });
  }
})();


// ── SCROLL UTILITIES ──────────────────────────
window.scrollToSection = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};
window.scrollToTop = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


// ── REVEAL ON SCROLL ──────────────────────────
(function initReveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, (entry.target.dataset.delay || 0) * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el, i) => {
    el.dataset.delay = i % 3;
    observer.observe(el);
  });
})();


// ── ANIMATED COUNTER ──────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const fills    = document.querySelectorAll('.stat-fill');

  function animateCount(el) {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString();
    }, step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counters.forEach(animateCount);
        fills.forEach(f => {
          f.style.width = f.style.width;
          setTimeout(() => f.classList.add('animated'), 300);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.getElementById('stats');
  if (statsSection) observer.observe(statsSection);
})();


// ── PORTFOLIO FILTER ──────────────────────────
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.portfolio-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const cat = item.dataset.cat;
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.style.display = '';
        } else {
          item.classList.add('hidden');
          setTimeout(() => {
            if (item.classList.contains('hidden')) item.style.display = 'none';
          }, 400);
        }
      });
    });
  });
})();


// ── TESTIMONIAL SLIDER ────────────────────────
let currentSlide = 0;
const slides = document.querySelectorAll('.testimonial-card');
const dots   = document.querySelectorAll('.dot');

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = n;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}
window.goToSlide = goToSlide;

setInterval(() => {
  goToSlide((currentSlide + 1) % slides.length);
}, 4500);


// ── CONTACT FORM ──────────────────────────────
window.submitForm = function () {
  const name    = document.getElementById('formName').value.trim();
  const email   = document.getElementById('formEmail').value.trim();
  const service = document.getElementById('formService').value;
  const msg     = document.getElementById('formMsg').value.trim();
  const success = document.getElementById('formSuccess');

  if (!name || !email || !service || !msg) {
    success.textContent = '⚠️ Sab fields fill karo please!';
    success.style.color = '#FF6B6B';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    success.textContent = '⚠️ Valid email address dalo!';
    success.style.color = '#FF6B6B';
    return;
  }

  // Simulate send
  const btn = document.querySelector('#contact .btn-primary');
  btn.textContent = 'Bhej Raha Hoon...';
  btn.disabled = true;

  setTimeout(() => {
    success.textContent = '✅ Message mil gaya! Hum jald hi reply karenge. 🚀';
    success.style.color = '#00F5FF';
    document.getElementById('formName').value  = '';
    document.getElementById('formEmail').value = '';
    document.getElementById('formService').value = '';
    document.getElementById('formMsg').value   = '';
    btn.textContent = 'Message Bhejo 🚀';
    btn.disabled = false;

    setTimeout(() => success.textContent = '', 5000);
  }, 1800);
};


// ── NEWSLETTER ────────────────────────────────
window.subscribeNewsletter = function () {
  const input = document.querySelector('.newsletter-input input');
  const btn   = document.querySelector('.newsletter-input button');
  if (!input) return;

  const email = input.value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    btn.textContent = '!';
    btn.style.background = '#FF6B6B';
    setTimeout(() => { btn.textContent = '→'; btn.style.background = ''; }, 2000);
    return;
  }

  btn.textContent = '✓';
  btn.style.background = '#00FF88';
  btn.style.color = '#0A0E27';
  input.value = '';
  setTimeout(() => {
    btn.textContent = '→';
    btn.style.background = '';
    btn.style.color = '';
  }, 3000);
};


// ── SMOOTH NAV ACTIVE ─────────────────────────
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}`
        ? 'var(--cyan)'
        : '';
    });
  });
})();


// ── PAGE LOAD ANIMATION ───────────────────────
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);
});

// ── STAT BAR ANIMATION FIX ───────────────────
document.querySelectorAll('.stat-fill').forEach(el => {
  el.style.setProperty('--w', el.style.width);
  el.style.width = '0';
});
