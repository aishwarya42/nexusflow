/* NexusFlow — Scroll Animations & Counter */
(function () {

  // ── Intersection Observer for reveal animations ──
  const revealEls = document.querySelectorAll('.reveal, .service-card, .sector-card, .result-card, .process-step');

  revealEls.forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, entry.target.dataset.delay || 0);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger cards
  document.querySelectorAll('.service-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
  });
  document.querySelectorAll('.sector-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
  });
  document.querySelectorAll('.result-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
  });

  revealEls.forEach(el => revealObserver.observe(el));
  document.querySelectorAll('.service-card, .sector-card, .result-card, .process-step').forEach(el => revealObserver.observe(el));

  // ── Counter Animation ──
  const counters = document.querySelectorAll('.stat-num');
  let countersStarted = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        counters.forEach(c => animateCounter(c));
        heroObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) heroObserver.observe(heroStats);

  // ── Section header reveals ──
  document.querySelectorAll('.section-header').forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

})();
