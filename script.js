/* ============================================================
   SHIRYON TZITZIT — SITE CONFIG
   Everything you'll ever need to edit lives in this block.
   ============================================================ */
const CONFIG = {
  // --- Preorder checkout (Thin) ---
  // Create a free Stripe Payment Link (stripe.com → Payment Links)
  // or a PayPal.me / PayPal button link, then paste it here:
  paymentLinks: {
    thin: "REPLACE_WITH_YOUR_STRIPE_OR_PAYPAL_LINK",
  },

  // --- Donate button ---
  // Create at paypal.com → "PayPal Donate button", or use paypal.me/yourname
  donateLink: "REPLACE_WITH_YOUR_PAYPAL_DONATE_LINK",

  // --- Waitlist email capture (Medium & Thick) ---
  // Sign up free at formspree.io, create a form, and paste its ID
  // (looks like "xqkrgbba"). Every submission is saved in your
  // Formspree dashboard as a list you can export to CSV.
  formspreeId: "REPLACE_WITH_YOUR_FORMSPREE_ID",

  // --- Pricing & shipping ---
  priceThin: "$18",
  priceMedium: "$18",   // shown on the Medium card (checkout reveals out of stock)
  priceThick: "$18",    // shown on the Thick card (checkout reveals out of stock)
  shipEstimate: "Fall 2026",

  // --- Funding progress bar ---
  // Update preordersSoFar by hand as orders come in, then push to GitHub.
  preordersSoFar: 0,
  preorderGoal: 250,
};

/* ============================================================
   You shouldn't need to edit below this line.
   ============================================================ */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---- Apply prices & shipping estimate ----
document.querySelectorAll("#price-thin, #price-hero").forEach((el) => {
  el.textContent = CONFIG.priceThin;
});
const priceMedium = document.getElementById("price-medium");
if (priceMedium) priceMedium.textContent = CONFIG.priceMedium;
const priceThick = document.getElementById("price-thick");
if (priceThick) priceThick.textContent = CONFIG.priceThick;
const ship = document.getElementById("ship-estimate");
if (ship) ship.textContent = CONFIG.shipEstimate;

// ---- Checkout buttons on Medium/Thick → reveal out-of-stock panel ----
document.querySelectorAll(".js-checkout").forEach((btn) => {
  btn.addEventListener("click", () => {
    const flow = btn.closest(".checkout-flow");
    const panel = flow.querySelector(".stock-panel");
    btn.disabled = true;
    btn.textContent = "Checking stock…";
    setTimeout(() => {
      btn.hidden = true;
      panel.hidden = false;
      panel.classList.add("open");
      panel.querySelector("input")?.focus();
    }, reducedMotion ? 0 : 650);
  });
});

// ---- Funding bar + animated counter ----
const fill = document.getElementById("funding-fill");
const count = document.getElementById("funding-count");
const goal = document.getElementById("funding-goal");
if (fill && count && goal) {
  goal.textContent = CONFIG.preorderGoal.toLocaleString();
  const pct = Math.min(100, (CONFIG.preordersSoFar / CONFIG.preorderGoal) * 100);

  if (reducedMotion) {
    count.textContent = CONFIG.preordersSoFar.toLocaleString();
    fill.style.width = pct + "%";
  } else {
    setTimeout(() => (fill.style.width = pct + "%"), 400);
    // count-up animation
    const target = CONFIG.preordersSoFar;
    const dur = 1200;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      count.textContent = Math.round(target * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}

// ---- Preorder buttons ----
document.querySelectorAll(".js-pay").forEach((btn) => {
  const product = btn.dataset.product;
  const link = CONFIG.paymentLinks[product];
  if (link && !link.startsWith("REPLACE")) {
    btn.href = link;
    btn.target = "_blank";
    btn.rel = "noopener";
  } else {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "Checkout isn't connected yet.\n\nSite owner: paste your Stripe or PayPal payment link into CONFIG.paymentLinks in script.js."
      );
    });
  }
});

// ---- Donate button ----
document.querySelectorAll(".js-donate").forEach((btn) => {
  if (CONFIG.donateLink && !CONFIG.donateLink.startsWith("REPLACE")) {
    btn.href = CONFIG.donateLink;
    btn.target = "_blank";
    btn.rel = "noopener";
  } else {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "Donations aren't connected yet.\n\nSite owner: paste your PayPal donate link into CONFIG.donateLink in script.js."
      );
    });
  }
});

// ---- Waitlist forms (Medium / Thick) → Formspree ----
document.querySelectorAll(".js-waitlist").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = form.querySelector(".form-msg");
    const input = form.querySelector("input[type=email]");
    const button = form.querySelector("button");
    const size = form.dataset.size;

    if (CONFIG.formspreeId.startsWith("REPLACE")) {
      msg.textContent =
        "Waitlist isn't connected yet. Add your Formspree ID in script.js.";
      msg.className = "form-msg err";
      return;
    }

    button.disabled = true;
    msg.textContent = "Adding you…";
    msg.className = "form-msg";

    try {
      const res = await fetch("https://formspree.io/f/" + CONFIG.formspreeId, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: input.value, size: size, source: "waitlist" }),
      });
      if (!res.ok) throw new Error("Request failed");
      msg.textContent = "Reserved! We'll email you the moment the " + size.split(" ")[0] + " ships.";
      msg.className = "form-msg ok";
      input.value = "";
    } catch {
      msg.textContent = "Something went wrong. Try again in a moment.";
      msg.className = "form-msg err";
    }
    button.disabled = false;
  });
});

// ---- Scroll reveal (IntersectionObserver) ----
const revealEls = document.querySelectorAll(".reveal");
if (reducedMotion) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
}

// ---- Nav shadow + hero watermark parallax on scroll ----
const nav = document.querySelector(".nav");
const watermark = document.querySelector(".hero-watermark");
let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 10);
    if (watermark && !reducedMotion) {
      watermark.style.transform = "translateY(calc(-50% + " + y * 0.12 + "px))";
    }
    ticking = false;
  });
});

// ---- Image placeholders: swap any missing image for a labeled drop-zone ----
document.querySelectorAll("img[data-placeholder]").forEach((img) => {
  const swap = () => {
    const ph = document.createElement("div");
    ph.className = "img-placeholder";
    // keep reveal state so layout animations still work
    if (img.classList.contains("reveal")) ph.classList.add("reveal", "in");
    ph.textContent = img.dataset.placeholder;
    img.replaceWith(ph);
  };
  img.addEventListener("error", swap);
  if (img.complete && img.naturalWidth === 0) swap();
});

// ---- Footer year ----
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ============================================================
   BRAID ENGINE v4 — pre-rendered seamless tile + scroll
   The twirl of a braid is mathematically a horizontal shift
   of the same pattern, so we render ONE finely-sampled,
   depth-sorted, seamlessly tiling braid image up front and
   animate by scrolling it with sub-pixel precision. No
   per-frame geometry, no shimmer, near-zero CPU.
   ============================================================ */

// Tzitzit palette: three wool-white strands + one strand of techelet blue
const STRANDS = [
  { light: [246, 250, 253], deep: [157, 184, 210], hi: [255, 255, 255] },
  { light: [46, 124, 196],  deep: [16, 55, 90],    hi: [159, 205, 242] }, // techelet
  { light: [238, 245, 251], deep: [150, 176, 203], hi: [255, 255, 255] },
  { light: [228, 238, 248], deep: [140, 166, 194], hi: [255, 255, 255] },
];

function lerpC(a, b, t) {
  return "rgb(" +
    Math.round(a[0] + (b[0] - a[0]) * t) + "," +
    Math.round(a[1] + (b[1] - a[1]) * t) + "," +
    Math.round(a[2] + (b[2] - a[2]) * t) + ")";
}

/* Depth-sorted cord renderer (used to bake the tile, and live
   during the intro's unravel). Fine step = smooth curves. */
function drawBraid(ctx, o) {
  const k = (Math.PI * 2) / o.wavelength;
  const step = o.step || 2.5;
  const len = o.vertical ? o.H : o.W;
  const n = STRANDS.length;
  const segs = [];

  for (let i = 0; i < n; i++) {
    const s = STRANDS[i];
    const phase = (i * Math.PI * 2) / n;
    const drift = (i - (n - 1) / 2) * (o.separation || 0);
    for (let u = o.from ?? 0; u < (o.to ?? len); u += step) {
      const u2 = u + step * 1.5;
      const th1 = k * u + phase + o.t, th2 = k * u2 + phase + o.t;
      const v1 = o.mid + o.amplitude * Math.sin(th1) + drift;
      const v2 = o.mid + o.amplitude * Math.sin(th2) + drift;
      segs.push({ z: Math.cos((th1 + th2) / 2), u, v1, u2, v2, s });
    }
  }
  segs.sort((a, b) => a.z - b.z);

  ctx.save();
  ctx.globalAlpha = o.opacity ?? 1;
  ctx.lineCap = "round";
  for (const g of segs) {
    const shade = Math.pow((g.z + 1) / 2, 0.9);
    const w = o.strokeW * (0.80 + 0.20 * g.z);
    let x1, y1, x2, y2;
    if (o.vertical) { x1 = g.v1; y1 = g.u; x2 = g.v2; y2 = g.u2; }
    else { x1 = g.u; y1 = g.v1; x2 = g.u2; y2 = g.v2; }

    ctx.strokeStyle = lerpC(g.s.deep, g.s.light, shade);
    ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

    if (g.z > 0.15) {
      const a = Math.min(1, (g.z - 0.15) / 0.85);
      let dx = x2 - x1, dy = y2 - y1;
      const L = Math.hypot(dx, dy) || 1;
      let nx = -dy / L, ny = dx / L;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const off = w * 0.28;
      const base = [
        Math.round(g.s.deep[0] + (g.s.light[0] - g.s.deep[0]) * shade),
        Math.round(g.s.deep[1] + (g.s.light[1] - g.s.deep[1]) * shade),
        Math.round(g.s.deep[2] + (g.s.light[2] - g.s.deep[2]) * shade)];
      ctx.strokeStyle = lerpC(base, g.s.hi, a * 0.9);
      ctx.lineWidth = w * 0.32;
      ctx.beginPath();
      ctx.moveTo(x1 + nx * off, y1 + ny * off);
      ctx.lineTo(x2 + nx * off, y2 + ny * off);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* Bake one seamlessly tiling wavelength of braid.
   We draw with a full wavelength of padding on each side so
   round caps and highlights blend across the seam, then crop
   the middle wavelength. */
function bakePattern(wl, h, amplitude, strokeW, dpr) {
  const padded = document.createElement("canvas");
  padded.width = wl * 3 * dpr; padded.height = h * dpr;
  const pctx = padded.getContext("2d");
  pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawBraid(pctx, {
    W: wl * 3, H: h, mid: h / 2, amplitude, wavelength: wl,
    t: 0, strokeW, vertical: false, from: 0, to: wl * 3,
  });
  const tile = document.createElement("canvas");
  tile.width = wl * dpr; tile.height = h * dpr;
  tile.getContext("2d").drawImage(padded, -wl * dpr, 0);
  return tile;
}

function fitCanvas(canvas) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr; canvas.height = h * dpr;
  }
  return { ctx: canvas.getContext("2d"), w, h, dpr };
}

/* ---------- Hero divider: scrolled pre-baked braid ---------- */
(function heroBraid() {
  const canvas = document.getElementById("braid-divider-canvas");
  if (!canvas) return;
  const WL = 300;
  let tile = null, tileDpr = 0, tileH = 0;

  function ensureTile(h, dpr) {
    if (!tile || tileDpr !== dpr || tileH !== h) {
      tile = bakePattern(WL, h, h * 0.26, 8.5, dpr);
      tileDpr = dpr; tileH = h;
    }
  }

  const state = { t: 0 };
  function paint() {
    const { ctx, w, h, dpr } = fitCanvas(canvas);
    ensureTile(h, dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // phase shift t == horizontal shift of t/k pixels
    const k = (Math.PI * 2) / WL;
    const offset = ((state.t / k) % WL + WL) % WL;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    for (let x = -offset; x < w; x += WL) {
      ctx.drawImage(tile, x * dpr, 0, WL * dpr, h * dpr);
    }
  }

  paint();
  window.addEventListener("resize", paint);
  if (reducedMotion) return;

  let running = true, last = performance.now();
  new IntersectionObserver(
    (e) => { running = e[0].isIntersecting; last = performance.now(); },
    { threshold: 0 }
  ).observe(canvas);

  (function loop(now) {
    requestAnimationFrame(loop);
    if (!running || document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.t += dt * 0.85;
    paint();
  })(last);
})();

/* ---------- Intro: scrolled tile while twirling, live during unravel ---------- */
(function intro() {
  const el = document.getElementById("intro");
  if (!el) return;
  const canvas = document.getElementById("intro-canvas");

  const skip = () => { el.remove(); document.body.classList.remove("intro-lock"); };
  if (reducedMotion) { skip(); return; }
  document.body.classList.add("intro-lock");

  const WL = 230, AMP = 30, SW = 11;
  const state = { t: 0, amplitude: AMP, separation: 0, opacity: 1 };
  let vTile = null;

  function bakeVertical(w, dpr) {
    // bake horizontally, then rotate by drawing transposed each frame is
    // costly; instead bake a vertical strip directly with the live renderer
    const c = document.createElement("canvas");
    c.width = w * dpr; c.height = WL * 3 * dpr;
    const cctx = c.getContext("2d");
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBraid(cctx, {
      W: w, H: WL * 3, mid: w / 2, amplitude: AMP, wavelength: WL,
      t: 0, strokeW: SW, vertical: true, from: 0, to: WL * 3,
    });
    const tile = document.createElement("canvas");
    tile.width = w * dpr; tile.height = WL * dpr;
    tile.getContext("2d").drawImage(c, 0, -WL * dpr);
    return tile;
  }

  const T_MARK = 350, T_UNRAVEL = 1450, T_FADE = 1800, T_END = 2600;
  let done = false;
  const finish = () => { if (!done) { done = true; skip(); } };
  el.addEventListener("click", finish);

  const t0 = performance.now();
  let lastT = t0;
  (function frame(now) {
    if (done) return;
    const ms = now - t0;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    const speed = ms < T_UNRAVEL ? 2.4 : 2.4 - 1.2 * Math.min(1, (ms - T_UNRAVEL) / 600);
    state.t += dt * speed;

    if (ms > T_MARK) el.classList.add("mark-in");

    const { ctx, w, h, dpr } = fitCanvas(canvas);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (ms <= T_UNRAVEL) {
      // silky scroll of the baked tile
      if (!vTile) vTile = bakeVertical(w, dpr);
      const k = (Math.PI * 2) / WL;
      const offset = ((state.t / k) % WL + WL) % WL;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      for (let y = -offset; y < h; y += WL) {
        ctx.drawImage(vTile, 0, y * dpr, w * dpr, WL * dpr);
      }
    } else {
      // live render only while the strands fly apart
      const p = Math.min(1, (ms - T_UNRAVEL) / (T_END - T_UNRAVEL));
      const ease = 1 - Math.pow(1 - p, 3);
      state.separation = ease * w * 0.65;
      state.amplitude = AMP + ease * 60;
      state.opacity = 1 - ease;
      el.classList.add("mark-out");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBraid(ctx, {
        W: w, H: h, mid: w / 2, amplitude: state.amplitude, wavelength: WL,
        t: state.t, separation: state.separation, opacity: state.opacity,
        strokeW: SW, vertical: true, step: 4,
      });
    }

    if (ms > T_FADE) el.classList.add("fade");
    if (ms >= T_END) { finish(); return; }
    requestAnimationFrame(frame);
  })(t0);

  setTimeout(finish, T_END + 900);
})();


// ---- Mobile dropdown menu ----
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.getElementById("nav-menu");
if (navToggle && navMenu) {
  const setOpen = (open) => {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open);
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  navToggle.addEventListener("click", () => {
    setOpen(!navMenu.classList.contains("open"));
  });
  // tapping a link closes the menu and lets the page scroll to the section
  navMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => setOpen(false))
  );
  // tapping anywhere else closes it too
  document.addEventListener("click", (e) => {
    if (!navMenu.classList.contains("open")) return;
    if (!e.target.closest(".nav-inner")) setOpen(false);
  });
}
