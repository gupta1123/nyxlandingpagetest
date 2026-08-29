const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ─────────────────────────────────────────────
   BACKGROUND — "ledger field"
   Ruled accounting paper. Every so often a single
   entry travels along a rule and settles at a
   column, leaving a mark that slowly fades.
───────────────────────────────────────────── */
(() => {
  const c = document.getElementById('bg-canvas');
  const ctx = c && c.getContext('2d');
  if (!ctx) return;

  const ROW = 38, COL = 152;
  let W, H, dpr, traces = [], marks = [], mx = -999, my = -999, gx = -999, gy = -999, tick = 0;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const rules = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(74,58,209,0.045)';
    for (let y = ROW; y < H; y += ROW) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(74,58,209,0.028)';
    for (let x = COL; x < W; x += COL) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); ctx.stroke(); }
  };

  const spawn = () => {
    if (traces.length > 6) return;
    const y = ROW * (1 + Math.floor(Math.random() * Math.floor(H / ROW - 1)));
    const dir = Math.random() > .45 ? 1 : -1;
    const from = dir === 1 ? -60 : W + 60;
    const stopCol = COL * (1 + Math.floor(Math.random() * Math.max(1, Math.floor(W / COL) - 1)));
    traces.push({ x: from, y, dir, stop: stopCol, v: .9 + Math.random() * 1.1, life: 0 });
  };

  const frame = () => {
    tick++;
    ctx.clearRect(0, 0, W, H);
    rules();

    gx += (mx - gx) * .06; gy += (my - gy) * .06;
    if (gx > -500) {
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 230);
      g.addColorStop(0, 'rgba(106,90,240,0.05)');
      g.addColorStop(1, 'rgba(106,90,240,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    if (tick % 55 === 0) spawn();

    traces = traces.filter(t => {
      t.x += t.dir * t.v;
      const arrived = t.dir === 1 ? t.x >= t.stop : t.x <= t.stop;
      const tail = 84;
      const g = ctx.createLinearGradient(t.x - t.dir * tail, t.y, t.x, t.y);
      g.addColorStop(0, 'rgba(106,90,240,0)');
      g.addColorStop(1, 'rgba(106,90,240,0.32)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(t.x - t.dir * tail, t.y); ctx.lineTo(t.x, t.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(t.x, t.y, 1.7, 0, 7); ctx.fillStyle = 'rgba(106,90,240,.5)'; ctx.fill();
      if (arrived) { marks.push({ x: t.stop, y: t.y, a: .42 }); return false; }
      return t.x > -160 && t.x < W + 160;
    });

    marks = marks.filter(m => {
      m.a -= .0022;
      if (m.a <= 0) return false;
      ctx.beginPath(); ctx.arc(m.x, m.y, 2.1, 0, 7);
      ctx.fillStyle = `rgba(53,39,156,${m.a})`; ctx.fill();
      ctx.beginPath(); ctx.arc(m.x, m.y, 6.5, 0, 7);
      ctx.strokeStyle = `rgba(53,39,156,${m.a * .28})`; ctx.lineWidth = 1; ctx.stroke();
      return true;
    });

    requestAnimationFrame(frame);
  };

  addEventListener('resize', resize, { passive: true });
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  resize();
  if (REDUCED) { rules(); } else { frame(); }
})();

/* ── nav + reveals + smooth scroll ── */
(() => {
  const nav = document.getElementById('site-nav');
  if (nav) {
    addEventListener('scroll', () => nav.classList.toggle('stuck', scrollY > 50), { passive: true });
  }

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: .08, rootMargin: '0px 0px -3% 0px' });
  document.querySelectorAll('.rv,.svc-card').forEach(el => io.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: REDUCED ? 'auto' : 'smooth' }); }
  }));
})();

/* ── capability ticker ── */
(() => {
  const words = ['Agentic AI','WhatsApp-to-SAP workflows','ERP automation','TallyPrime workflows','SAP automation','Document intelligence','Human-in-the-loop approvals','Verified system actions'];
  const t = document.getElementById('ticker');
  if (!t) return;
  t.innerHTML = Array.from({ length: 3 }, () => words.map(w => `<span class="ticker-item">${w}<span class="t-sep">◆</span></span>`).join('')).join('');
})();

/* ─────────────────────────────────────────────
   HERO — THE READING BEAM
   Statement narration rises, crosses the agent's
   reading line, and leaves as a structured entry.
───────────────────────────────────────────── */
(() => {
  const field = document.getElementById('st-field');
  if (!field) return;

  const lines = [
    { r: 'NEFT-CR-HDFC0000123-SHAKTI STEEL TRAD-9834112', n: 'Shakti Steel Traders', m: 'Receipt · bill 4471 · bill-wise', a: '₹4,80,000', s: 'matched' },
    { r: 'UPI/DR/451920388/METAROLL/YESB/metaroll@ybl', n: 'Metaroll', m: 'Purchase · GST 18% · input credit', a: '₹1,24,560', s: 'matched' },
    { r: 'CHQ PAID-000432-SURYADEV ALLOYS PVT LTD', n: 'Suryadev Alloys', m: 'Payment · 2 bills cleared', a: '₹9,60,000', s: 'matched' },
    { r: 'IMPS/P2A/224913/KKB GROUP/NO REF', n: 'KKB Group', m: 'No open bill matches this amount', a: '₹52,300', s: 'for review', h: 1 },
    { r: 'RTGS CR SBIN52026 GIRIRAJ REROLLS LTD', n: 'Giriraj Rerolls', m: 'Receipt · bill 3391 · part payment', a: '₹6,15,400', s: 'matched' },
    { r: 'ACH D- MEENAKSHI GROUP-AUTO DEBIT-0092', n: 'Meenakshi Group', m: 'Purchase · recurring · monthly', a: '₹78,200', s: 'matched' },
    { r: 'NEFT-CR-ICIC0000456-GERMAN STEEL IND P', n: 'German Steel', m: 'Receipt · 3 bills · bill-wise', a: '₹11,20,000', s: 'matched' },
    { r: 'CASH DEP-BR0421-SAMRAT GROUP HYDERABAD', n: 'Samrat Group Hyderabad', m: 'Two ledgers share this name', a: '₹2,05,000', s: 'for review', h: 1 },
    { r: 'NEFT-CR-PUNB0234-BHULESHWAR SEAMLESS PVT', n: 'Bhuleshwar Seamless Private', m: 'Receipt · bill 5120 · full', a: '₹3,42,750', s: 'matched' },
    { r: 'BRN-CLG-CHQ 000517-ECO-R LLP-OUTWARD', n: 'Eco-R LLP', m: 'Payment · bill 2287 cleared', a: '₹1,89,300', s: 'matched' },
    { r: 'NEFT-DR-HDFC0000123-GST PAY-ARN0824119', n: 'GST payment', m: 'Tax · GSTR-3B for August', a: '₹4,12,880', s: 'matched' },
    { r: 'UPI/CR/770231884/SHAKTI ENGG/HDFC/NO REF', n: 'Shakti Engineering', m: 'Advance received · no bill yet', a: '₹95,000', s: 'for review', h: 1 }
  ];

  const GAP = 56, SPEED = 0.34;
  let items = [], idx = 0, beamY = 0, raf;

  const measure = () => { beamY = field.clientHeight * 0.52; };

  const make = () => {
    const d = lines[idx % lines.length]; idx++;
    const el = document.createElement('div');
    el.className = 'ln';
    el.innerHTML = `<div class="ln-raw">${d.r}</div>
      <div class="ln-out"><span><span class="ln-name">${d.n}</span><span class="ln-meta">${d.m}</span></span>
      <span class="ln-amt">${d.a}<em>${d.s}</em></span></div>`;
    if (d.h) el.classList.add('hold');
    field.appendChild(el);
    const prev = items[items.length - 1];
    return { el, y: prev ? prev.y + GAP : field.clientHeight + 20, done: false };
  };

  const frame = () => {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.y -= SPEED;
      it.el.style.transform = `translateY(${it.y}px)`;
      if (!it.done && it.y <= beamY - 8) { it.done = true; it.el.classList.add('done'); }
      if (it.y < -70) { it.el.remove(); items.splice(i, 1); }
    }
    const last = items[items.length - 1];
    if (!last || last.y < field.clientHeight) items.push(make());
    raf = requestAnimationFrame(frame);
  };

  measure();
  addEventListener('resize', measure, { passive: true });

  if (REDUCED) {
    for (let k = 0; k < 6; k++) {
      const it = make();
      it.y = field.clientHeight - 40 - k * GAP;
      it.el.style.transform = `translateY(${it.y}px)`;
      if (it.y <= beamY - 8) it.el.classList.add('done');
      items.push(it);
    }
    return;
  }

  for (let k = 0; k < 7; k++) {
    const it = make();
    it.y = field.clientHeight - 30 - k * GAP;
    it.el.style.transform = `translateY(${it.y}px)`;
    if (it.y <= beamY - 8) { it.done = true; it.el.classList.add('done'); }
    items.push(it);
  }
  items.reverse();
  frame();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame);
  });

  /* a hair of parallax — the panel leans toward the cursor */
  const panel = document.querySelector('.stream');
  const hero = document.querySelector('.hero');
  if (panel && hero && matchMedia('(hover:hover)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', e => {
      const r = panel.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * .9)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * .9)));
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    (function lean() {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      panel.style.transform = `rotateY(${cx * 3.4}deg) rotateX(${-cy * 2.6}deg)`;
      requestAnimationFrame(lean);
    })();
  }
})();

/* ── CLIENT LINE — pause, identify, and colour the focused organisation ── */
(() => {
  const lane = document.getElementById('client-lane');
  const cap = document.getElementById('client-caption');
  if (!lane || !cap) return;

  const items = [...lane.querySelectorAll('.cl2-item')];
  const defaultCaption = cap.firstElementChild?.cloneNode(true);
  let swapTimer;
  let lockedName = '';

  const renderCaption = (name, sector) => {
    cap.replaceChildren();
    const line = document.createElement('span');
    const title = document.createElement('b');
    const separator = document.createElement('em');
    const detail = document.createElement('em');
    title.textContent = name;
    separator.className = 'sep';
    separator.textContent = '·';
    detail.textContent = sector;
    line.append(title, separator, detail);
    cap.append(line);
  };

  const swapCaption = (name, sector) => {
    cap.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      renderCaption(name, sector);
      cap.classList.remove('is-swapping');
    }, 160);
  };

  const activate = item => {
    const name = item.dataset.name || '';
    lane.classList.add('is-held');
    items.forEach(other => other.classList.toggle('is-on', other.dataset.name === name));
    swapCaption(name, item.dataset.sector || '');
  };

  const restore = () => {
    lane.classList.remove('is-held');
    items.forEach(item => item.classList.remove('is-on'));
    cap.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      if (defaultCaption) cap.replaceChildren(defaultCaption.cloneNode(true));
      cap.classList.remove('is-swapping');
    }, 160);
  };

  items.forEach(item => {
    item.addEventListener('pointerenter', () => {
      if (!lockedName) activate(item);
    });
    item.addEventListener('focus', () => activate(item));
    item.addEventListener('click', event => {
      event.stopPropagation();
      const name = item.dataset.name || '';
      if (lockedName === name) {
        lockedName = '';
        restore();
        item.blur();
        return;
      }
      lockedName = name;
      activate(item);
    });
  });
  lane.addEventListener('pointerleave', () => {
    if (!lockedName) restore();
  });
  lane.addEventListener('focusout', event => {
    if (!lockedName && !lane.contains(event.relatedTarget)) restore();
  });
  document.addEventListener('click', event => {
    if (!lockedName || lane.contains(event.target)) return;
    lockedName = '';
    restore();
  });

  lane.querySelectorAll('.cl2-item img').forEach(image => {
    image.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = 'cl2-word';
      fallback.textContent = image.closest('.cl2-item')?.dataset.name || 'Organisation';
      image.replaceWith(fallback);
    });
  });
})();

/* ── PHILOSOPHY — scroll-linked trace rail ── */
(() => {
  const wrap = document.getElementById('phi-right');
  const prog = document.getElementById('phi-prog');
  if (!wrap) return;
  const cards = [...wrap.querySelectorAll('.phi-card')];
  const draw = () => {
    const r = wrap.getBoundingClientRect();
    const anchor = innerHeight * .62;
    const p = Math.min(1, Math.max(0, (anchor - r.top) / (r.height * .9)));
    prog.style.height = (p * (r.height - 38)) + 'px';
    cards.forEach(c => {
      const cr = c.getBoundingClientRect();
      c.classList.toggle('lit', cr.top < anchor);
    });
  };
  addEventListener('scroll', draw, { passive: true });
  addEventListener('resize', draw, { passive: true });
  draw();
})();
