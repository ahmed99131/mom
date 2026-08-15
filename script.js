/* =========================================================================
   CONFIG — edit everything here, no need to touch the rest of the file
   ========================================================================= */
const CONFIG = {
  motherName: "Mom",

  // Paste your own YouTube link (any format works: youtu.be/... or youtube.com/watch?v=...)
  youtubeUrl: "https://www.youtube.com/watch?v=nZ41BVL9OnU",

  photos: [
    { src: "images/mom1.jpg", caption: "Just the two of us ❤️" },
    { src: "images/mom2.jpg", caption: "One of my favorite memories ❤️" },
    { src: "images/mom3.jpg", caption: "All together, always ❤️" },
    { src: "images/mom4.jpg", caption: "Every trip is better with you ❤️" },
    { src: "images/mom5.jpg", caption: "My favorite person ❤️" }
  ]
};

/* =========================================================================
   INIT
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  applyMotherName();
  buildGallery();
  initLightbox();
  initGiftButton();
  initMusicPlayer();
  initRevealOnScroll();
  initParticles();
});

/* Replace every [data-mother-name] element's "Mom" with CONFIG.motherName */
function applyMotherName() {
  if (!CONFIG.motherName || CONFIG.motherName === "Mom") return;
  document.querySelectorAll("[data-mother-name]").forEach(el => {
    el.innerHTML = el.innerHTML.replace(/Mom\b/g, CONFIG.motherName);
  });
}

/* =========================================================================
   GALLERY
   ========================================================================= */
function buildGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  CONFIG.photos.forEach((photo, i) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Open photo: ${photo.caption}`);
    item.dataset.index = i;

    item.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption}" loading="lazy">
      <div class="gallery-caption">${photo.caption}</div>
    `;

    grid.appendChild(item);
  });
}

/* =========================================================================
   LIGHTBOX
   ========================================================================= */
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close");
  const grid = document.getElementById("gallery-grid");

  function open(index) {
    const photo = CONFIG.photos[index];
    if (!photo) return;
    img.src = photo.src;
    img.alt = photo.caption;
    caption.textContent = photo.caption;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  grid.addEventListener("click", e => {
    const item = e.target.closest(".gallery-item");
    if (item) open(Number(item.dataset.index));
  });

  grid.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("gallery-item")) {
      e.preventDefault();
      open(Number(e.target.dataset.index));
    }
  });

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
}

/* =========================================================================
   GIFT BUTTON — confetti burst + music starts immediately + scroll to reveal
   ========================================================================= */
function initGiftButton() {
  const btn = document.getElementById("gift-btn");
  const skip = document.getElementById("skip-link");

  function openGift() {
    burstConfetti();
    startMusic();
    setTimeout(() => {
      document.getElementById("message-section").scrollIntoView({ behavior: "smooth" });
    }, 350);
  }

  btn.addEventListener("click", openGift);
  skip.addEventListener("click", () => {
    document.getElementById("message-section").scrollIntoView({ behavior: "smooth" });
  });
}

/* =========================================================================
   REVEAL ON SCROLL — fades each section in as it enters the viewport
   ========================================================================= */
function initRevealOnScroll() {
  const sections = document.querySelectorAll(".reveal-section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in-view");
    });
  }, { threshold: 0.2 });

  sections.forEach(s => observer.observe(s));
}

/* =========================================================================
   MUSIC PLAYER — starts on gift open, no second click required
   ========================================================================= */
function getYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /[?&]v=([^?&]+)/,
    /embed\/([^?&]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

let musicStarted = false;

function startMusic() {
  const btn = document.getElementById("music-btn");
  const label = document.getElementById("music-btn-label");
  const player = document.getElementById("music-player");
  const videoId = getYouTubeId(CONFIG.youtubeUrl);

  if (!videoId || CONFIG.youtubeUrl.includes("YOUR_YOUTUBE_LINK_HERE")) {
    label.textContent = "Add your song link in CONFIG ✏️";
    return;
  }

  if (musicStarted) {
    player.hidden = false;
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
  iframe.title = "Our song";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  iframe.allowFullscreen = true;
  player.appendChild(iframe);
  player.hidden = false;
  musicStarted = true;
  label.textContent = "Now Playing 🎵";
  btn.classList.add("playing");
}

function initMusicPlayer() {
  const btn = document.getElementById("music-btn");
  const player = document.getElementById("music-player");

  btn.addEventListener("click", () => {
    if (musicStarted) {
      player.hidden = !player.hidden;
    } else {
      startMusic();
    }
  });
}

/* =========================================================================
   AMBIENT PARTICLES — soft drifting petals + gold sparkles on a canvas
   ========================================================================= */
function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    const count = w < 600 ? 16 : 28;
    particles = Array.from({ length: count }, () => spawn(true));
  }

  function spawn(randomY) {
    const isSparkle = Math.random() > 0.6;
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -20,
      r: isSparkle ? 1.5 + Math.random() * 2 : 4 + Math.random() * 5,
      speed: 0.25 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.5,
      sway: Math.random() * Math.PI * 2,
      sparkle: isSparkle,
      opacity: 0.25 + Math.random() * 0.35
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.sway += 0.01;
      p.y += p.speed;
      p.x += p.drift + Math.sin(p.sway) * 0.3;

      if (p.y > h + 20) Object.assign(p, spawn(false));

      ctx.beginPath();
      if (p.sparkle) {
        ctx.fillStyle = `rgba(199,154,75,${p.opacity})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      } else {
        ctx.fillStyle = `rgba(196,99,138,${p.opacity})`;
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, p.sway, 0, Math.PI * 2);
      }
      ctx.fill();
    });
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  window.addEventListener("resize", () => { resize(); makeParticles(); });
  draw();
}

/* =========================================================================
   CONFETTI BURST — elegant petals, sparkles & tiny hearts on gift open
   ========================================================================= */
function burstConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);
  const colors = ["#C4638A", "#C79A4B", "#E8CE95", "#8E3A57", "#F6DCE3"];

  const pieces = Array.from({ length: 90 }, () => ({
    x: w / 2 + (Math.random() - 0.5) * 120,
    y: h * 0.42,
    vx: (Math.random() - 0.5) * 11,
    vy: -Math.random() * 12 - 4,
    size: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    shape: Math.random() > 0.7 ? "heart" : "petal",
    life: 1
  }));

  canvas.style.opacity = 1;
  const gravity = 0.32;
  let frame = 0;
  const maxFrames = 130;

  function drawPetal(p) {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHeart(p) {
    const s = p.size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.6);
    ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.2, -s * 1.1, 0, -s * 0.3);
    ctx.bezierCurveTo(s * 0.2, -s * 1.1, s, -s * 0.4, 0, s * 0.6);
    ctx.fill();
  }

  function tick() {
    frame++;
    ctx.clearRect(0, 0, w, h);
    pieces.forEach(p => {
      p.vy += gravity * 0.05;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      if (frame > maxFrames * 0.55) p.life -= 0.03;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      if (p.shape === "heart") drawHeart(p); else drawPetal(p);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      canvas.style.opacity = 0;
      ctx.clearRect(0, 0, w, h);
    }
  }

  requestAnimationFrame(tick);
}
