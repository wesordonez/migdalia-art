/* ─────────────────────────────────────────────────────────────
   m. mixedmedia — script
   - Mobile nav toggle
   - Active-section highlight in nav
   - Reveal on scroll
   - Lightbox for gallery
   - Year stamp in footer
   - Form submit handling (form.app friendly + graceful fallback)
   ───────────────────────────────────────────────────────────── */

(() => {

  /* ───── Year ───── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ───── Mobile nav toggle ───── */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close mobile nav when a link is tapped
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });


  /* ───── Active section highlight ───── */
  const sections = ['gallery', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const linkFor = id => navLinks?.querySelector(`a[href="#${id}"]`);

  const setActive = id => {
    navLinks?.querySelectorAll('a').forEach(a => a.classList.remove('is-active'));
    if (id) linkFor(id)?.classList.add('is-active');
  };

  const io = new IntersectionObserver((entries) => {
    // pick the topmost visible section
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible[0]) setActive(visible[0].target.id);
  }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });

  sections.forEach(s => io.observe(s));


  /* ───── Reveal on scroll ───── */
  const revealTargets = document.querySelectorAll(
    '.section__head, .art, .about__copy, .about__portrait, .contact__info, .contact__form, .hero__left, .hero__contact'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealIO.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  revealTargets.forEach(el => revealIO.observe(el));


  /* ───── Lightbox ───── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  const lightboxCap  = document.getElementById('lightboxCaption');
  const closeBtn     = document.getElementById('lightboxClose');
  const prevBtn      = document.getElementById('lightboxPrev');
  const nextBtn      = document.getElementById('lightboxNext');
  const figures      = [...document.querySelectorAll('.art')];

  let currentIndex = -1;

  const openLightbox = (idx) => {
    if (!figures[idx]) return;
    currentIndex = idx;
    const fig = figures[idx];
    const img = fig.querySelector('img');
    const titleEl = fig.querySelector('h3');
    const metaEl  = fig.querySelector('.art__meta');
    const descEl  = fig.querySelector('figcaption p:last-child');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';

    const title = titleEl ? `<strong>${titleEl.textContent}</strong>` : '';
    const desc  = descEl ? descEl.textContent : '';
    const meta  = metaEl ? `<div class="art__meta">${metaEl.textContent}</div>` : '';
    lightboxCap.innerHTML = title + desc + meta;

    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    setTimeout(() => { lightbox.hidden = true; }, 250);
    document.body.style.overflow = '';
    currentIndex = -1;
  };

  const step = (delta) => {
    if (currentIndex < 0) return;
    const next = (currentIndex + delta + figures.length) % figures.length;
    openLightbox(next);
  };

  figures.forEach((f, i) => {
    f.addEventListener('click', () => openLightbox(i));
  });

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox?.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  step(-1);
    if (e.key === 'ArrowRight') step(1);
  });


  /* ─────────────────────────────────────────────────────────────
     Contact form
     ─────────────────────────────────────────────────────────────
     This handles submission for form.app endpoints. It:
       1. POSTs the form data as JSON to the form's `action` URL.
       2. Shows a status message inline (no page reload).
       3. Falls back to a mailto: link if the endpoint hasn't been set yet.

     If you instead pasted a full <iframe> embed from form.app, the
     <form> below won't exist and this block quietly does nothing.
     ───────────────────────────────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status) return;

    const submitBtn = form.querySelector('button[type=submit]');
    const action = form.getAttribute('action') || '';

    // If the endpoint hasn't been configured yet, fall back to mailto.
    if (action.includes('REPLACE_WITH_YOUR_FORM_ID') || !action) {
      const data = Object.fromEntries(new FormData(form).entries());
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\n${data.message}`
      );
      const subject = encodeURIComponent(`[m-mixedmedia.art] ${data.subject || 'Message'}`);
      window.location.href = `mailto:hello@m-mixedmedia.art?subject=${subject}&body=${body}`;
      status.textContent = 'Opening your email app…';
      status.className = 'form__status is-ok';
      return;
    }

    submitBtn.disabled = true;
    status.textContent = 'Sending…';
    status.className = 'form__status';

    try {
      const res = await fetch(action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        form.reset();
        status.textContent = 'Thank you — your message is on its way.';
        status.className = 'form__status is-ok';
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      status.textContent = 'Something went wrong. Please email hello@m-mixedmedia.art directly.';
      status.className = 'form__status is-error';
    } finally {
      submitBtn.disabled = false;
    }
  });

})();
