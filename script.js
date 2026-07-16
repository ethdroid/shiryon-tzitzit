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
   BRAID ENGINE v2 — smooth woven tzitzit strings
   Over/under boundaries are solved analytically each frame
   (θ = ±π/2 + 2πn), so segment endpoints glide continuously
   instead of snapping to the sampling grid. Dense sampling +
   round joins keep the curves silky.
   ============================================================ */
const SVGNS = "http://www.w3.org/2000/svg";
const TWO_PI = Math.PI * 2;

function createBraid(svg, opts) {
  const { vertical = false, strands, strokeW = 8, step = 4 } = opts;

  const layers = { shadow: [], back: [], front: [], hi: [] };
  const gBack = document.createElementNS(SVGNS, "g");
  const gFront = document.createElementNS(SVGNS, "g");
  svg.appendChild(gBack);
  svg.appendChild(gFront);

  strands.forEach((s) => {
    const mk = (stroke, w, dim) => {
      const p = document.createElementNS(SVGNS, "path");
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", stroke);
      p.setAttribute("stroke-width", w);
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      if (dim) p.setAttribute("opacity", dim);
      return p;
    };
    const shadow = mk(s.deep, strokeW + 2.5, 0.9);
    const back = mk(s.deep, strokeW, 0.85);
    const front = mk(s.color, strokeW);
    const hi = mk(s.highlight, strokeW * 0.3, 0.8);
    gBack.appendChild(shadow); gBack.appendChild(back);
    gFront.appendChild(front); gFront.appendChild(hi);
    layers.shadow.push(shadow); layers.back.push(back);
    layers.front.push(front); layers.hi.push(hi);
  });

  const state = {
    t: 0,
    length: opts.length,
    mid: opts.mid,
    amplitude: opts.amplitude,
    wavelength: opts.wavelength,
    separation: 0,
    opacity: 1,
  };

  const fmt = (u, v) =>
    vertical ? v.toFixed(2) + " " + u.toFixed(2) : u.toFixed(2) + " " + v.toFixed(2);

  function render() {
    const k = TWO_PI / state.wavelength;
    const n = strands.length;

    for (let i = 0; i < n; i++) {
      const phase = (i * TWO_PI) / n;
      const drift = (i - (n - 1) / 2) * state.separation;
      const yAt = (u) => state.mid + state.amplitude * Math.sin(k * u + phase + state.t) + drift;

      // ---- full path (back layers) ----
      let full = "M " + fmt(0, yAt(0));
      for (let u = step; u < state.length; u += step) full += " L " + fmt(u, yAt(u));
      full += " L " + fmt(state.length, yAt(state.length));

      // ---- front segments, exact boundaries ----
      // strand is "over" while cos(θ) > 0, i.e. θ ∈ (−π/2 + 2πm, π/2 + 2πm)
      // θ = k·u + phase + t  →  u = (θ − phase − t) / k
      let frontD = "";
      const uOf = (theta) => (theta - phase - state.t) / k;
      const thetaStart = k * 0 + phase + state.t;
      const mMin = Math.floor((thetaStart + Math.PI / 2) / TWO_PI) - 1;
      const thetaEnd = k * state.length + phase + state.t;
      const mMax = Math.ceil((thetaEnd + Math.PI / 2) / TWO_PI) + 1;

      for (let m = mMin; m <= mMax; m++) {
        let a = uOf(-Math.PI / 2 + m * TWO_PI);
        let b = uOf(Math.PI / 2 + m * TWO_PI);
        a = Math.max(0, a); b = Math.min(state.length, b);
        if (b - a < 0.5) continue;
        frontD += " M " + fmt(a, yAt(a));
        for (let u = a + step; u < b; u += step) frontD += " L " + fmt(u, yAt(u));
        frontD += " L " + fmt(b, yAt(b));
      }

      layers.shadow[i].setAttribute("d", full);
      layers.back[i].setAttribute("d", full);
      layers.front[i].setAttribute("d", frontD || "M -10 -10");
      layers.hi[i].setAttribute("d", frontD || "M -10 -10");
    }
    svg.style.opacity = state.opacity;
  }

  render();
  return { state, render };
}

// Tzitzit palette: three wool-white strands + one strand of techelet blue
const STRAND_COLORS = [
  { color: "#f6fafd", deep: "#a9c3dd", highlight: "#ffffff" },
  { color: "#2e7cc4", deep: "#144975", highlight: "#9fcdf2" }, // techelet
  { color: "#eef5fb", deep: "#9db8d2", highlight: "#ffffff" },
  { color: "#e4eef8", deep: "#8fadca", highlight: "#ffffff" },
];

/* ---------- Hero divider: endless twirling braid ---------- */
(function heroBraid() {
  const svg = document.getElementById("braid-divider-svg");
  if (!svg) return;
  const braid = createBraid(svg, {
    length: 1200, mid: 50, amplitude: 26, wavelength: 300,
    strands: STRAND_COLORS, strokeW: 8, step: 4,
  });
  if (reducedMotion) return; // static braid still shows

  let running = true, last = performance.now();
  new IntersectionObserver(
    (e) => { running = e[0].isIntersecting; last = performance.now(); },
    { threshold: 0 }
  ).observe(svg);

  (function loop(now) {
    requestAnimationFrame(loop);
    if (!running || document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    braid.state.t += dt * 0.85;          // calm, silky twirl
    braid.render();
  })(last);
})();

/* ---------- Intro: braid twirls, then unravels — every page load ---------- */
(function intro() {
  const el = document.getElementById("intro");
  if (!el) return;
  const svg = document.getElementById("intro-svg");

  const skip = () => { el.remove(); document.body.classList.remove("intro-lock"); };
  if (reducedMotion) { skip(); return; }
  document.body.classList.add("intro-lock");

  const H = Math.max(window.innerHeight, 700);
  const W = Math.max(window.innerWidth, 400);
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  const braid = createBraid(svg, {
    vertical: true,
    length: H, mid: W / 2, amplitude: 30, wavelength: 230,
    strands: STRAND_COLORS, strokeW: 10, step: 5,
  });

  const T_MARK = 350;      // shield fades in
  const T_UNRAVEL = 1450;  // strands fly apart
  const T_FADE = 1800;     // overlay fades
  const T_END = 2600;

  let done = false;
  const finish = () => { if (!done) { done = true; skip(); } };
  el.addEventListener("click", finish); // tap to skip

  const t0 = performance.now();
  let lastT = t0;
  (function frame(now) {
    if (done) return;
    const ms = now - t0;
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    // twirl fast at first, ease off smoothly as it unravels
    const speed = ms < T_UNRAVEL ? 2.4 : 2.4 - 1.2 * Math.min(1, (ms - T_UNRAVEL) / 600);
    braid.state.t += dt * speed;

    if (ms > T_MARK) el.classList.add("mark-in");

    if (ms > T_UNRAVEL) {
      const p = Math.min(1, (ms - T_UNRAVEL) / (T_END - T_UNRAVEL));
      const ease = 1 - Math.pow(1 - p, 3);
      braid.state.separation = ease * W * 0.65;
      braid.state.amplitude = 30 + ease * 60;
      braid.state.opacity = 1 - ease;
      el.classList.add("mark-out");
    }
    if (ms > T_FADE) el.classList.add("fade");

    braid.render();
    if (ms >= T_END) { finish(); return; }
    requestAnimationFrame(frame);
  })(t0);

  // hard fallback so the site is never stuck behind the overlay
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
