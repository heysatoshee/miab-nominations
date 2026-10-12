/* =========================================================
   Most Impactful African Bitcoiners — Nominations
   ========================================================= */

// Edit these two values each edition.
const CONFIG = {
  year: 2026,
  deadline: '2026-10-31T00:00:00Z', // nominations close (UTC)
};

const root = document.documentElement;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Edition + deadline copy ---------- */
const deadline = new Date(CONFIG.deadline);
const fmt = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(deadline);
const dayMonth = fmt({ day: 'numeric', month: 'short' });
const fullDate = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const time = fmt({ hour: '2-digit', minute: '2-digit', hour12: false });

$$('[data-year]').forEach((el) => (el.textContent = CONFIG.year));
$$('[data-deadline-short]').forEach((el) => (el.textContent = `Closes ${dayMonth}`));
$$('[data-deadline-long], [data-deadline-step]').forEach((el) => (el.textContent = `Nominations close on ${fullDate}.`));
$$('[data-deadline-full]').forEach((el) => (el.textContent = `${fullDate} · ${time} GMT`));
$$('[data-deadline-faq]').forEach((el) => (el.textContent = `Nominations close on ${fullDate} at ${time} GMT. Nominations received after the deadline won’t be considered.`));

/* ---------- Countdown ---------- */
const cdEls = $$('[data-cd]');
const pad = (n) => String(n).padStart(2, '0');

function setClosed() {
  root.classList.add('is-closed');
  $$('[data-status]').forEach((el) => (el.textContent = 'Nominations closed'));
  $$('[data-deadline-short]').forEach((el) => (el.textContent = `Closed ${dayMonth}`));
}

function tickCountdown() {
  const diff = deadline - Date.now();
  if (diff <= 0) { setClosed(); return false; }
  const parts = {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff / 36e5) % 24),
    m: Math.floor((diff / 6e4) % 60),
    s: Math.floor((diff / 1e3) % 60),
  };
  cdEls.forEach((el) => {
    const v = pad(parts[el.dataset.cd]);
    if (el.textContent !== v) {
      el.textContent = v;
      if (!reduceMotion && el.closest('.bigclock')) {
        el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
      }
    }
  });
  return true;
}
if (tickCountdown()) {
  const t = setInterval(() => { if (!tickCountdown()) clearInterval(t); }, 1000);
}

/* ---------- Split hero headline into words ---------- */
(function splitWords() {
  const el = $('[data-split]');
  if (!el) return;
  let i = 0;
  const wrap = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span');
          w.className = 'w';
          const inner = document.createElement('span');
          inner.style.setProperty('--i', i++);
          inner.textContent = part;
          w.append(inner);
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        wrap(child);
      }
    });
  };
  el.setAttribute('aria-label', el.textContent.trim());
  wrap(el);
  $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
})();

/* ---------- Hero entrance ---------- */
(function heroIntro() {
  const img = $('.hero__photo img');
  let done = false;
  const go = () => {
    if (done) return; done = true;
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-loaded')));
  };
  if (img.complete) go();
  else { img.addEventListener('load', go, { once: true }); img.addEventListener('error', go, { once: true }); }
  setTimeout(go, 1600);
})();

/* ---------- Nav: glass on scroll, hide on scroll down ---------- */
(function nav() {
  const nav = $('[data-nav]');
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    const delta = y - lastY;
    if (y > 640 && delta > 6) nav.classList.add('is-hidden');
    else if (delta < -6 || y < 640) nav.classList.remove('is-hidden');
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();

/* ---------- Scroll reveals ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal]').forEach((el) => revealIO.observe(el));

const stepsIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in-view');
    stepsIO.unobserve(e.target);
  });
}, { threshold: 0.35 });
$$('[data-steps]').forEach((el) => stepsIO.observe(el));

/* ---------- Count-up stats ---------- */
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target;
    const to = +el.dataset.count;
    if (reduceMotion) { el.textContent = to; return; }
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => { el.textContent = '0'; countIO.observe(el); });

/* ---------- Hero parallax (pointer + scroll) ---------- */
(function parallax() {
  if (reduceMotion) return;
  const hero = $('.hero');
  const layers = $$('[data-parallax]', hero).map((el) => ({ el, f: +el.dataset.parallax }));
  const photo = $('.hero__photo');
  const desktop = matchMedia('(min-width: 961px)');
  let tx = 0, ty = 0, cx = 0, cy = 0, visible = true, raf = 0;

  if (finePointer) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }
  addEventListener('scroll', kick, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);

  function kick() { if (!raf && visible) raf = requestAnimationFrame(frame); }
  function frame() {
    raf = 0;
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    const sy = Math.min(scrollY, innerHeight);
    layers.forEach(({ el, f }) => {
      const extra = el === photo && desktop.matches ? sy * 0.12 : 0;
      el.style.transform = `translate3d(${(-cx * f).toFixed(2)}px, ${(-cy * f + extra).toFixed(2)}px, 0)`;
    });
    if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) kick();
  }
})();

/* ---------- Gold dust ---------- */
// Gold dust tuning
window.MIAB_DUST = { density: 1, speed: 1, size: 1, brightness: 1 };

(function dust() {
  const canvas = $('.hero__dust');
  const hero = $('.hero');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, parts = [], running = false, raf = 0;

  // Pre-rendered soft dot sprites
  const sprite = (rgb) => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.25, `rgba(${rgb},.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return c;
  };
  const sprites = [sprite('246,215,160'), sprite('255,245,226'), sprite('244,120,90')];

  const rand = (a, b) => a + Math.random() * (b - a);
  const make = (initial) => {
    const right = Math.random() < 0.72;
    return {
      x: right ? rand(w * 0.42, w) : rand(0, w),
      y: initial ? rand(0, h) : h + 20,
      r: rand(0.6, 2.6) * (Math.random() < 0.08 ? 2.4 : 1),
      vy: rand(0.12, 0.45),
      vx: rand(-0.12, 0.12),
      a: rand(0.25, 0.9),
      t: rand(0, Math.PI * 2),
      ts: rand(0.008, 0.03),
      s: Math.random() < 0.7 ? 0 : Math.random() < 0.75 ? 1 : 2,
    };
  };

  function resize() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(400, Math.round(((w * h) / 14000) * window.MIAB_DUST.density));
    parts = Array.from({ length: n }, () => make(true));
    if (reduceMotion) draw();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const { speed, size: sz, brightness } = window.MIAB_DUST;
    for (const p of parts) {
      p.t += p.ts * speed;
      p.y -= p.vy * speed;
      p.x += (p.vx + Math.sin(p.t) * 0.15) * speed;
      if (p.y < -20 || p.x < -20 || p.x > w + 20) Object.assign(p, make(false));
      const fadeTop = Math.min(1, p.y / (h * 0.25));
      const alpha = p.a * (0.55 + 0.45 * Math.sin(p.t * 1.7)) * fadeTop;
      if (alpha <= 0.01) continue;
      ctx.globalAlpha = Math.min(1, alpha * brightness);
      const size = p.r * 6 * sz;
      ctx.drawImage(sprites[p.s], p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  function loop() { draw(); raf = requestAnimationFrame(loop); }
  function start() { if (running || reduceMotion) return; running = true; loop(); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize();
  window.MIAB_DUST_REBUILD = resize;
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
})();

/* ---------- Illustrated cards: measure icon paths for the draw-in ---------- */
$$('.cat__art-icon path').forEach((p) => p.style.setProperty('--len', Math.ceil(p.getTotalLength() + 1)));

/* ---------- Category card spotlight ---------- */
if (finePointer) {
  $$('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

/* ---------- Nomination form ---------- */
const ICONS = {
  individual: '<path d="M12 14.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"/><path d="M8.6 13.4 7.2 21l4.8-2.8 4.8 2.8-1.4-7.6"/>',
  builder: '<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
  project: '<path d="M12 2.5 21.5 7.5 12 12.5 2.5 7.5 12 2.5ZM2.5 12 12 17l9.5-5M2.5 16.5 12 21.5l9.5-5"/>',
  product: '<path d="M8 2.5h8a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2Z"/><path d="M10.5 18.5h3"/>',
  circular: '<path d="M20 12a8 8 0 0 1-14.6 4.5M4 12a8 8 0 0 1 14.6-4.5M18.8 3.5v4.2h-4.2M5.2 20.5v-4.2h4.2"/>',
  media: '<path d="M12 2.5a3 3 0 0 1 3 3V11a3 3 0 0 1-6 0V5.5a3 3 0 0 1 3-3Z"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4.5"/>',
  miner: '<path d="M7 7h10v10H7V7ZM10 10h4v4h-4v-4ZM9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4"/>',
};

// One entry per award. Order here = order in the form dropdown.
const CATEGORIES = [
  { id: 'individual', name: '21 Most Impactful Bitcoiners', hint: 'Individuals driving adoption', label: 'Nominee’s full name', story: 'What did they do this year, and who benefited? Events, education, code, community…' },
  { id: 'builder', name: 'Builder of the Year', hint: 'Developers shipping code & tools', label: 'Builder’s full name', story: 'What did they build or ship this year, and who uses it?', isNew: true },
  { id: 'project', name: 'Project of the Year', hint: 'Initiatives & programmes', label: 'Project name', story: 'What does it do, and what changed because of it this year?' },
  { id: 'product', name: 'Product of the Year', hint: 'Wallets, apps, services, hardware', label: 'Product name', story: 'What does it do, who uses it, and what improved this year?', isNew: true },
  { id: 'circular', name: 'Circular Economy of the Year', hint: 'Communities using Bitcoin daily', label: 'Community name & town', story: 'How is Bitcoin used day to day here? Merchants, savings, education, meetups…' },
  { id: 'media', name: 'Media Initiative of the Year', hint: 'Podcasts, publications, channels', label: 'Media initiative name', story: 'What did they publish or produce this year, and who did it reach?', isNew: true },
  { id: 'miner', name: 'Bitcoin Miner of the Year', hint: 'Home & industrial mining', label: 'Miner or operation name', story: 'Tell us about the operation: scale, energy source and local impact.' },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const svg = (id) => `<svg viewBox="0 0 24 24">${ICONS[id]}</svg>`;

const COUNTRIES = ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Côte d’Ivoire', 'DR Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Republic of the Congo', 'Rwanda', 'São Tomé and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe', 'Pan-African / multiple countries'];

const form = $('[data-form]');
const done = $('[data-done]');

if (form) {
  const select = $('#f-country', form);
  COUNTRIES.forEach((c) => select.add(new Option(c, c)));

  const nomineeLabel = $('[data-label-nominee]', form);
  const story = $('[data-story]', form);
  const countOut = $('[data-count-out]', form);
  const max = +story.getAttribute('maxlength');

  /* Category picker (accessible listbox) */
  const picker = $('[data-picker]', form);
  const pBtn = $('[data-picker-btn]', picker);
  const pList = $('[data-picker-list]', picker);
  const catInput = form.elements.category;
  let activeIdx = 0;

  pList.innerHTML = CATEGORIES.map((c, i) => `
    <li class="picker__opt" role="option" id="opt-${c.id}" data-value="${c.id}" data-i="${i}" aria-selected="false">
      <span class="picker__opt-icon" aria-hidden="true">${svg(c.id)}</span>
      <span class="picker__opt-text"><b>${c.name}${c.isNew ? '<i class="picker__opt-new">New</i>' : ''}</b><small>${c.hint}</small></span>
      <span class="picker__opt-check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span>
    </li>`).join('');
  const opts = $$('.picker__opt', pList);

  const setActive = (i) => {
    activeIdx = (i + opts.length) % opts.length;
    opts.forEach((o, j) => o.classList.toggle('is-active', j === activeIdx));
    pList.setAttribute('aria-activedescendant', opts[activeIdx].id);
    opts[activeIdx].scrollIntoView({ block: 'nearest' });
  };
  const openPicker = () => {
    picker.classList.add('is-open');
    pBtn.setAttribute('aria-expanded', 'true');
    setActive(CATEGORIES.findIndex((c) => c.id === catInput.value));
    pList.focus({ preventScroll: true });
  };
  const closePicker = (refocus = true) => {
    picker.classList.remove('is-open');
    pBtn.setAttribute('aria-expanded', 'false');
    if (refocus) pBtn.focus({ preventScroll: true });
  };

  const setCategory = (id) => {
    const c = CAT[id];
    catInput.value = id;
    $('[data-picker-icon]', picker).innerHTML = svg(id);
    $('[data-picker-name]', picker).textContent = c.name;
    $('[data-picker-hint]', picker).textContent = c.hint;
    opts.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.value === id)));
    nomineeLabel.textContent = c.label;
    story.placeholder = c.story;
  };
  const applyCategory = () => setCategory(catInput.value);

  pBtn.addEventListener('click', () => (picker.classList.contains('is-open') ? closePicker() : openPicker()));
  pBtn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openPicker(); }
  });
  pList.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
    else if (k === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
    else if (k === 'Home') { e.preventDefault(); setActive(0); }
    else if (k === 'End') { e.preventDefault(); setActive(opts.length - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); setCategory(opts[activeIdx].dataset.value); closePicker(); }
    else if (k === 'Escape') { e.preventDefault(); closePicker(); }
    else if (k === 'Tab') closePicker(false);
  });
  opts.forEach((o) => {
    o.addEventListener('pointermove', () => { if (+o.dataset.i !== activeIdx) setActive(+o.dataset.i); });
    o.addEventListener('click', () => { setCategory(o.dataset.value); closePicker(); });
  });
  document.addEventListener('pointerdown', (e) => {
    if (picker.classList.contains('is-open') && !picker.contains(e.target)) closePicker(false);
  });

  applyCategory();

  const updateCount = () => { countOut.textContent = `${story.value.length} / ${max}`; };
  story.addEventListener('input', updateCount);
  updateCount();

  // Whole card is clickable
  $$('.cat').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.cat__cta')) $('.cat__cta', card).click();
    });
  });

  // Card CTAs → preselect category, glide to form, focus first field
  $$('[data-nominate]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (root.classList.contains('is-closed')) { $('#nominate').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
      setCategory(btn.dataset.nominate);
      $('#nominate').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const after = () => {
        picker.classList.remove('flash'); void picker.offsetWidth; picker.classList.add('flash');
        $('#f-nominee').focus({ preventScroll: true });
      };
      if ('onscrollend' in window && !reduceMotion) addEventListener('scrollend', after, { once: true });
      else setTimeout(after, reduceMotion ? 0 : 800);
    });
  });

  // Validation
  const rules = {
    nominee: (v) => (v.trim().length < 2 ? 'Please tell us who you’re nominating.' : ''),
    country: (v) => (!v ? 'Please choose a country.' : ''),
    link: (v) => {
      if (!v.trim()) return '';
      try { const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`); return u.hostname.includes('.') ? '' : 'That link doesn’t look right.'; }
      catch { return 'That link doesn’t look right.'; }
    },
    story: (v) => (v.trim().length < 60 ? `A little more detail, please (at least 60 characters; ${v.trim().length} so far).` : ''),
    name: (v) => (v.trim().length < 2 ? 'Please add your name.' : ''),
    email: (v) => (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Please enter a valid email address.' : ''),
  };
  let attempted = false;

  const check = (name) => {
    const input = form.elements[name];
    const field = input.closest('.field');
    const msg = rules[name](input.value);
    field.classList.toggle('has-error', !!msg);
    $('.field__err', field).textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  };

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    const evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, () => { if (attempted || input.closest('.has-error')) check(name); });
    input.addEventListener('blur', () => { if (attempted) check(name); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    attempted = true;
    const results = Object.keys(rules).map((n) => [n, check(n)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) { form.elements[firstBad[0]].focus(); return; }

    // TODO: send the nomination to your form backend here (e.g. fetch to WP / Gravity Forms / Fluent Forms endpoint).
    const data = Object.fromEntries(new FormData(form));
    $('[data-done-name]').textContent = data.nominee.trim();
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.closest('.formcard').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    confetti($('.done__confetti'));
  });

  $('[data-again]').addEventListener('click', () => {
    const cat = catInput.value;
    form.reset();
    catInput.value = cat;
    attempted = false;
    $$('.field', form).forEach((f) => { f.classList.remove('has-error'); $('.field__err', f).textContent = ''; });
    applyCategory(); updateCount();
    done.hidden = true;
    form.hidden = false;
    $('#f-nominee').focus();
  });
}

/* ---------- Confetti ---------- */
function confetti(canvas) {
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = r.width * dpr; canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#f45341', '#e9b96e', '#1d4744', '#f6d7a0', '#ff8a6b'];
  const pieces = Array.from({ length: 140 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
    const speed = 6 + Math.random() * 9;
    return {
      x: r.width / 2, y: r.height * 0.36,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0],
    };
  });
  const start = performance.now();
  (function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, r.width, r.height);
    pieces.forEach((p) => {
      p.vy += 0.28; p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t / 2600);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.rot * 2));
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t < 2700) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, r.width, r.height);
  })(start);
}

/* ---------- FAQ accordion ---------- */
$$('.acc__btn').forEach((btn, i) => {
  const item = btn.closest('.acc__item');
  const set = (open) => { item.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', String(open)); };
  if (i === 0) set(true);
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
});

/* ---------- Mobile dock CTA ---------- */
(function dock() {
  const dockEl = $('[data-dock]');
  if (!dockEl) return;
  const state = { hero: true, form: false, footer: false };
  const sync = () => dockEl.classList.toggle('is-visible', !state.hero && !state.form && !state.footer);
  const watch = (el, key) => new IntersectionObserver(([e]) => { state[key] = e.isIntersecting; sync(); }).observe(el);
  // Hide the dock until the hero buttons have scrolled up out of view (not while they're still below the fold)
  new IntersectionObserver(([e]) => { state.hero = e.isIntersecting || e.boundingClientRect.top > 0; sync(); }).observe($('.hero__ctas'));
  watch($('#nominate'), 'form');
  watch($('.footer'), 'footer');
})();
