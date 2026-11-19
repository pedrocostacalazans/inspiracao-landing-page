/**
 * InspirAção — Apresentação Mobile Executiva
 * Pure Vanilla JavaScript (Zero Dependencies)
 */

const GOOGLE_SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbz88cx3yIOudS7mfprLs88UWT569ZW6gc2feqv1ch7iLDrLeeUu4pgslUapFlIRfaV3/exec";

let currentSkyPhase = "day";
const warmedImages = new Map();

function warmImage(src) {
  if (!src) return Promise.resolve();
  if (warmedImages.has(src)) return warmedImages.get(src);
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  const promise = (
    typeof img.decode === "function" ? img.decode() : Promise.resolve()
  )
    .catch(() => {})
    .then(() => img);
  warmedImages.set(src, promise);
  return promise;
}

function scheduleIdle(fn, timeout = 1200) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 140);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const skyControls = initSkyParticles();
  initSkyPhaseSwitcher(skyControls);
  const deckApi = initDeckNavigation(skyControls);
  const lightboxApi = initScreenLightbox();
  initPhoneCarousels(deckApi, lightboxApi);
  initBetaModal();
});

/* ==========================================================================
   1. Partículas Atmosféricas na Capa (#slide-1)
   ========================================================================== */
function initSkyParticles() {
  const canvas = document.getElementById("sky-particles");
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const host = canvas.parentElement;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let rafId = null;
  let isCanvasActive = true;

  function resize() {
    if (!host) return;
    width = canvas.width = host.offsetWidth;
    height = canvas.height = host.offsetHeight;
    const count = Math.min(44, Math.max(16, Math.floor((width * height) / 22000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.9,
      r: Math.random() * 2.2 + 0.9,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -Math.random() * 0.2 - 0.04,
      alpha: Math.random() * 0.5 + 0.16,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    const isNight = currentSkyPhase === "midnight";

    for (const p of particles) {
      if (!reducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.02;

        if (p.y < -8) p.y = height * 0.9;
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
      }

      const alpha = Math.max(
        0.08,
        Math.min(0.85, p.alpha + Math.sin(p.phase) * 0.2),
      );
      ctx.beginPath();
      ctx.arc(p.x, p.y, isNight ? p.r * 0.9 : p.r * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = isNight
        ? `rgba(233, 238, 255, ${alpha})`
        : `rgba(255, 255, 255, ${alpha * 0.65})`;
      ctx.fill();
    }
  }

  function tick() {
    if (reducedMotion || !isCanvasActive || document.hidden) {
      rafId = null;
      return;
    }
    drawParticles();
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (reducedMotion || !isCanvasActive || document.hidden || rafId !== null) {
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function setActive(active) {
    isCanvasActive = Boolean(active);
    if (isCanvasActive) {
      startLoop();
    } else {
      stopLoop();
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  window.addEventListener("resize", () => {
    resize();
    drawParticles();
  }, { passive: true });

  resize();
  drawParticles();
  startLoop();

  return { redraw: drawParticles, setActive };
}

/* ==========================================================================
   2. Seletor das 4 Fases do Céu 24h (Capa & Encerramento)
   ========================================================================== */
const SKY_CONFIGS = {
  dawn: {
    caption: "Amanhecer · 06:30",
    themeColor: "#45689D",
    ventuImg: "./assets/images/opt/ventu-piscando.webp",
  },
  day: {
    caption: "Dia Solar · 15:07",
    themeColor: "#3F70B4",
    ventuImg: "./assets/images/opt/ventu-onda.webp",
  },
  dusk: {
    caption: "Entardecer · 18:24",
    themeColor: "#394371",
    ventuImg: "./assets/images/opt/ventu-nuvem.webp",
  },
  midnight: {
    caption: "Noite · 23:00",
    themeColor: "#1E2C54",
    ventuImg: "./assets/images/opt/ventu-dormindo.webp",
  },
};

function initSkyPhaseSwitcher(skyControls) {
  const buttons = document.querySelectorAll(".sky-phase-btn");
  const captionEl = document.getElementById("sky-phase-caption");
  const ventuImg = document.getElementById("ventu-hero-img");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  let phaseSeq = 0;

  function applyPhase(phase) {
    const cfg = SKY_CONFIGS[phase];
    if (!cfg) return;

    const seq = ++phaseSeq;
    currentSkyPhase = phase;
    document.documentElement.setAttribute("data-sky", phase);
    skyControls?.redraw?.();

    buttons.forEach((btn) => {
      const isActive = btn.dataset.phase === phase;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    if (captionEl) captionEl.textContent = cfg.caption;
    if (themeMeta) themeMeta.setAttribute("content", cfg.themeColor);
    if (ventuImg) {
      if (ventuImg.getAttribute("src") !== cfg.ventuImg) {
        ventuImg.style.opacity = "0.3";
        warmImage(cfg.ventuImg).then(() => {
          if (seq !== phaseSeq) return;
          ventuImg.src = cfg.ventuImg;
          ventuImg.style.opacity = "1";
        });
      } else {
        ventuImg.style.opacity = "1";
      }
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyPhase(btn.dataset.phase));
  });
}

/* ==========================================================================
   3. Navegação do Deck Vertical (1 Slide por Gesto + Janela 3-Layer GPU)
   ========================================================================== */
function initDeckNavigation(skyControls) {
  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".deck-slide"));
  const dots = Array.from(document.querySelectorAll(".deck-dot"));
  const hud = document.getElementById("deck-hud");
  const dotsNav = document.getElementById("deck-dots");
  const counterEl = document.getElementById("hud-counter");
  const progressBar = document.getElementById("deck-progress-bar");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let activeIndex = 0;
  let isTransitioning = false;
  let wheelLockUntil = 0;

  let preloadQueue = [];
  let preloadCursor = 0;
  let activeWorkers = 0;
  const maxPreloadConcurrency = 2;

  function isOverlayOpen() {
    const lightboxOpen = document
      .getElementById("screen-lightbox")
      ?.classList.contains("open");
    const modalOpen = document
      .getElementById("download-modal")
      ?.classList.contains("open");
    return Boolean(lightboxOpen || modalOpen);
  }

  function warmSlidePrimary(index) {
    const slide = slides[index];
    if (!slide) return;
    const firstImg = slide.querySelector("img");
    if (!firstImg) return;
    if (firstImg.loading === "lazy") {
      firstImg.loading = "eager";
    }
    warmImage(firstImg.getAttribute("src"));
  }

  function warmSlideSecondary(index) {
    const slide = slides[index];
    if (!slide) return;
    slide.querySelectorAll("img").forEach((img, i) => {
      if (i === 0) return;
      if (img.loading === "lazy") {
        img.loading = "eager";
      }
      warmImage(img.getAttribute("src"));
    });
  }

  function warmNeighbors(idx) {
    warmSlidePrimary(idx - 1);
    warmSlidePrimary(idx + 1);
    warmSlideSecondary(idx);
  }

  function pumpPreloadQueue() {
    while (
      !isTransitioning &&
      activeWorkers < maxPreloadConcurrency &&
      preloadCursor < preloadQueue.length
    ) {
      const src = preloadQueue[preloadCursor++];
      activeWorkers += 1;
      warmImage(src).finally(() => {
        activeWorkers = Math.max(0, activeWorkers - 1);
        if (!isTransitioning) {
          pumpPreloadQueue();
        }
      });
    }
  }

  function clearSlideInlineStyles(slide) {
    slide.style.transform = "";
    slide.style.visibility = "";
    slide.style.zIndex = "";
    slide.style.willChange = "";
  }

  function updateChrome(idx, progressOverride) {
    dots.forEach((dot, i) => {
      const isCurrent = i === idx;
      dot.classList.toggle("active", isCurrent);
      if (isCurrent) {
        dot.setAttribute("aria-current", "step");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (counterEl && slides.length > 0) {
      const num = String(idx + 1).padStart(2, "0");
      const total = String(slides.length).padStart(2, "0");
      counterEl.textContent = `${num} / ${total}`;
    }

    const slide = slides[idx];
    if (slide) {
      const hudTheme = slide.dataset.hud === "dark" ? "hud-dark" : "hud-light";
      [hud, dotsNav].forEach((el) => {
        if (!el) return;
        el.classList.remove("hud-light", "hud-dark");
        el.classList.add(hudTheme);
      });
    }

    if (progressBar && slides.length > 0) {
      const base = (idx + 1) / slides.length;
      const raw = typeof progressOverride === "number" ? progressOverride : base;
      const scale = Math.min(1, Math.max(1 / slides.length, raw));
      progressBar.style.transform = `scaleX(${scale.toFixed(4)})`;
    }
  }

  function applySlideWindow(idx) {
    slides.forEach((slide, i) => {
      slide.classList.remove(
        "is-above",
        "is-prev",
        "is-active",
        "is-next",
        "is-moving",
      );
      clearSlideInlineStyles(slide);

      if (i < idx - 1) {
        slide.classList.add("is-above");
      } else if (i === idx - 1) {
        slide.classList.add("is-prev");
      } else if (i === idx) {
        slide.classList.add("is-active");
      } else if (i === idx + 1) {
        slide.classList.add("is-next");
      }
    });

    updateChrome(idx);
  }

  function goToSlide(targetIdx) {
    if (!deck || slides.length === 0 || isTransitioning) return;
    const target = Math.max(0, Math.min(slides.length - 1, targetIdx));
    if (target === activeIndex) return;

    const fromSlide = slides[activeIndex];
    const toSlide = slides[target];
    const dir = target > activeIndex ? 1 : -1;

    isTransitioning = true;
    skyControls?.setActive?.(false);

    if (Math.abs(target - activeIndex) > 1) {
      toSlide.classList.remove("is-above", "is-prev", "is-next", "is-moving");
      toSlide.style.transform = `translate3d(0, ${dir * 100}%, 0)`;
      toSlide.style.visibility = "visible";
      toSlide.style.willChange = "transform";
    }
    toSlide.style.zIndex = "4";

    void toSlide.offsetHeight;

    fromSlide.classList.add("is-moving");
    toSlide.classList.add("is-moving");
    updateChrome(target);

    fromSlide.style.transform = `translate3d(0, ${-dir * 100}%, 0)`;
    toSlide.style.transform = "translate3d(0, 0, 0)";

    let finished = false;
    let fallbackTimer = null;

    function finishTransition() {
      if (finished) return;
      finished = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      toSlide.removeEventListener("transitionend", onTransitionEnd);

      activeIndex = target;
      applySlideWindow(activeIndex);
      isTransitioning = false;
      skyControls?.setActive?.(activeIndex === 0);

      scheduleIdle(() => {
        warmNeighbors(activeIndex);
        pumpPreloadQueue();
      }, 250);
    }

    function onTransitionEnd(e) {
      if (e.target === toSlide && e.propertyName === "transform") {
        finishTransition();
      }
    }

    if (reducedMotion) {
      finishTransition();
      return;
    }

    toSlide.addEventListener("transitionend", onTransitionEnd);
    fallbackTimer = setTimeout(finishTransition, 410);
  }

  function snapBack(neighborSlide, dir) {
    const activeSlide = slides[activeIndex];
    if (!activeSlide) return;

    isTransitioning = true;
    skyControls?.setActive?.(false);

    activeSlide.classList.add("is-moving");
    if (neighborSlide) {
      neighborSlide.classList.add("is-moving");
    }

    activeSlide.style.transform = "translate3d(0, 0, 0)";
    if (neighborSlide) {
      neighborSlide.style.transform = `translate3d(0, ${dir * 100}%, 0)`;
    }
    updateChrome(activeIndex);

    let finished = false;
    let fallbackTimer = null;

    function finishSnapBack() {
      if (finished) return;
      finished = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      activeSlide.removeEventListener("transitionend", onSnapEnd);

      applySlideWindow(activeIndex);
      isTransitioning = false;
      skyControls?.setActive?.(activeIndex === 0);
      scheduleIdle(pumpPreloadQueue, 250);
    }

    function onSnapEnd(e) {
      if (e.target === activeSlide && e.propertyName === "transform") {
        finishSnapBack();
      }
    }

    if (reducedMotion) {
      finishSnapBack();
      return;
    }

    activeSlide.addEventListener("transitionend", onSnapEnd);
    fallbackTimer = setTimeout(finishSnapBack, 390);
  }

  if (deck && slides.length > 0) {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastY = 0;
    let lastTime = 0;
    let touchActive = false;
    let touchAxis = null;
    let dragDy = 0;
    let dragDir = 0;
    let dragNeighbor = null;

    deck.addEventListener(
      "touchstart",
      (e) => {
        if (isTransitioning || isOverlayOpen() || e.touches.length !== 1) {
          touchActive = false;
          return;
        }
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        lastY = t.clientY;
        startTime = performance.now();
        lastTime = startTime;
        touchActive = true;
        touchAxis = null;
        dragDy = 0;
        dragDir = 0;
        dragNeighbor = null;
      },
      { passive: true },
    );

    deck.addEventListener(
      "touchmove",
      (e) => {
        if (!touchActive || isTransitioning || e.touches.length !== 1) return;
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!touchAxis) {
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
          if (Math.abs(dx) > Math.abs(dy) * 1.1) {
            touchAxis = "x";
            return;
          }
          touchAxis = "y";
          skyControls?.setActive?.(false);
        }

        if (touchAxis !== "y") return;
        e.preventDefault();

        const now = performance.now();
        if (now - lastTime >= 16) {
          lastY = t.clientY;
          lastTime = now;
        }

        const h = deck.clientHeight || window.innerHeight || 1;
        const atTop = activeIndex === 0 && dy > 0;
        const atBottom = activeIndex === slides.length - 1 && dy < 0;

        if (atTop || atBottom) {
          const resisted = Math.sign(dy) * Math.min(56, Math.abs(dy) * 0.22);
          if (dragNeighbor) {
            dragNeighbor.style.transform = "";
            dragNeighbor = null;
          }
          dragDy = resisted;
          dragDir = 0;
          slides[activeIndex].style.transform = `translate3d(0, ${resisted.toFixed(1)}px, 0)`;
          return;
        }

        const clampedDy = Math.max(-h * 0.9, Math.min(h * 0.9, dy));
        const dir = clampedDy < 0 ? 1 : -1;

        if (dragNeighbor && dragDir !== dir) {
          dragNeighbor.style.transform = "";
          dragNeighbor = null;
        }

        const neighbor = slides[activeIndex + dir] || null;
        dragNeighbor = neighbor;
        dragDir = dir;
        dragDy = clampedDy;

        slides[activeIndex].style.transform = `translate3d(0, ${clampedDy.toFixed(1)}px, 0)`;
        if (neighbor) {
          neighbor.style.transform = `translate3d(0, calc(${dir * 100}% + ${clampedDy.toFixed(1)}px), 0)`;
        }

        if (progressBar) {
          const ratio = (activeIndex + 1 - clampedDy / h) / slides.length;
          const scale = Math.min(1, Math.max(1 / slides.length, ratio));
          progressBar.style.transform = `scaleX(${scale.toFixed(4)})`;
        }
      },
      { passive: false },
    );

    function handleTouchFinish(e) {
      if (!touchActive) return;
      const wasVertical = touchAxis === "y";
      const neighbor = dragNeighbor;
      const dir = dragDir;
      const dy = dragDy;

      touchActive = false;
      touchAxis = null;
      dragNeighbor = null;
      dragDy = 0;
      dragDir = 0;

      if (!wasVertical || isTransitioning) return;

      const changed = e.changedTouches?.[0];
      const now = performance.now();
      const recentVel = changed
        ? Math.abs(changed.clientY - lastY) / Math.max(16, now - lastTime)
        : 0;
      const overallVel = Math.abs(dy) / Math.max(16, now - startTime);
      const velocity = Math.max(recentVel, overallVel);

      if ((dy < -42 || (dy < -18 && velocity > 0.35)) && activeIndex < slides.length - 1) {
        goToSlide(activeIndex + 1);
      } else if ((dy > 42 || (dy > 18 && velocity > 0.35)) && activeIndex > 0) {
        goToSlide(activeIndex - 1);
      } else if (dy !== 0) {
        snapBack(neighbor, dir);
      } else {
        skyControls?.setActive?.(activeIndex === 0);
      }
    }

    deck.addEventListener("touchend", handleTouchFinish, { passive: true });
    deck.addEventListener("touchcancel", handleTouchFinish, { passive: true });

    deck.addEventListener(
      "wheel",
      (e) => {
        if (isOverlayOpen()) return;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        e.preventDefault();

        const now = performance.now();
        if (
          isTransitioning ||
          now < wheelLockUntil ||
          Math.abs(e.deltaY) < 20
        ) {
          return;
        }
        wheelLockUntil = now + 520;
        goToSlide(activeIndex + (e.deltaY > 0 ? 1 : -1));
      },
      { passive: false },
    );
  }

  window.addEventListener("load", () => {
    setTimeout(() => {
      scheduleIdle(() => {
        const queue = [
          SKY_CONFIGS.dawn.ventuImg,
          SKY_CONFIGS.dusk.ventuImg,
          SKY_CONFIGS.midnight.ventuImg,
        ];
        slides.forEach((slide) => {
          slide.querySelectorAll("img").forEach((img) => {
            const src = img.getAttribute("src");
            if (src && !warmedImages.has(src) && !queue.includes(src)) {
              queue.push(src);
            }
          });
        });
        preloadQueue = queue;
        preloadCursor = 0;
        pumpPreloadQueue();
      });
    }, 800);
  });

  document.querySelectorAll("[data-goto]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      goToSlide(Number(trigger.dataset.goto || 0));
    });
  });

  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName;
    if (isOverlayOpen() || activeTag === "INPUT" || activeTag === "TEXTAREA") {
      return;
    }

    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToSlide(slides.length - 1);
    } else if (e.key === "ArrowRight") {
      slides[activeIndex]?._stepCarousel?.(1);
    } else if (e.key === "ArrowLeft") {
      slides[activeIndex]?._stepCarousel?.(-1);
    }
  });

  applySlideWindow(0);
  warmSlidePrimary(0);
  warmSlidePrimary(1);
  warmSlidePrimary(2);
  skyControls?.setActive?.(true);

  return {
    getActiveSlideIndex: () => activeIndex,
    goToSlide,
  };
}

/* ==========================================================================
   4. Carrosséis Horizontais Sincronizados (Telas Reais + Halo Cromático)
   ========================================================================== */
function initPhoneCarousels(_deckApi, lightboxApi) {
  const showcaseSlides = document.querySelectorAll(".showcase-slide");

  showcaseSlides.forEach((slide) => {
    const track = slide.querySelector(".phone-track");
    const items = Array.from(slide.querySelectorAll(".phone-screen-item"));
    const tabsWrap = slide.querySelector(".screen-tabs");
    const tabs = Array.from(slide.querySelectorAll(".screen-tab"));
    const prevBtn = slide.querySelector(".stage-prev");
    const nextBtn = slide.querySelector(".stage-next");
    const expandBtn = slide.querySelector(".zoom-expand-btn");

    if (!track || items.length === 0) return;

    let currentIdx = 0;

    function syncUI(idx) {
      currentIdx = Math.max(0, Math.min(items.length - 1, idx));
      slide._currentScreen = currentIdx;

      tabs.forEach((tab, i) => {
        const isActive = i === currentIdx;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      const activeTab = tabs[currentIdx];
      if (tabsWrap && activeTab && tabsWrap.scrollWidth > tabsWrap.clientWidth) {
        const targetLeft =
          activeTab.offsetLeft -
          (tabsWrap.clientWidth - activeTab.offsetWidth) / 2;
        tabsWrap.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: "smooth",
        });
      }

      if (prevBtn) prevBtn.disabled = currentIdx === 0;
      if (nextBtn) nextBtn.disabled = currentIdx === items.length - 1;

      const accent = items[currentIdx]?.dataset.accent;
      if (accent) {
        slide.dataset.accent = accent;
      }
    }

    function scrollToScreen(idx) {
      const target = Math.max(0, Math.min(items.length - 1, idx));
      track.scrollTo({
        left: target * track.clientWidth,
        behavior: "smooth",
      });
      syncUI(target);
    }

    slide._stepCarousel = (delta) => {
      scrollToScreen(currentIdx + delta);
    };

    let trackRaf = null;
    track.addEventListener(
      "scroll",
      () => {
        if (trackRaf) return;
        trackRaf = requestAnimationFrame(() => {
          trackRaf = null;
          const width = track.clientWidth || 1;
          const idx = Math.round(track.scrollLeft / width);
          if (idx !== currentIdx) {
            syncUI(idx);
          }
        });
      },
      { passive: true },
    );

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        scrollToScreen(Number(tab.dataset.screenIdx || 0));
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => scrollToScreen(currentIdx - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => scrollToScreen(currentIdx + 1));
    }

    function openSlideZoom(startIdx) {
      lightboxApi.open(items, startIdx, (newIdx) => {
        scrollToScreen(newIdx);
      });
    }

    items.forEach((item, i) => {
      item.addEventListener("click", () => openSlideZoom(i));
    });

    if (expandBtn) {
      expandBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openSlideZoom(currentIdx);
      });
    }

    syncUI(0);
  });
}

/* ==========================================================================
   5. Lightbox Fullscreen com Swipe e Teclado
   ========================================================================== */
function initScreenLightbox() {
  const lightbox = document.getElementById("screen-lightbox");
  const imgEl = document.getElementById("lightbox-img");
  const labelEl = document.getElementById("lightbox-label");
  const counterEl = document.getElementById("lightbox-counter");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const stageEl = document.getElementById("lightbox-stage");

  let activeItems = [];
  let activeIdx = 0;
  let syncCallback = null;
  let touchStartX = 0;

  function render(idx) {
    if (activeItems.length === 0) return;
    activeIdx = Math.max(0, Math.min(activeItems.length - 1, idx));

    const figure = activeItems[activeIdx];
    const sourceImg = figure.querySelector("img");
    if (imgEl && sourceImg) {
      imgEl.src = sourceImg.currentSrc || sourceImg.src;
      imgEl.alt = sourceImg.alt || "";
    }
    if (labelEl) {
      labelEl.textContent = figure.dataset.label || "Tela do App";
    }
    if (counterEl) {
      counterEl.textContent = `${activeIdx + 1} / ${activeItems.length}`;
    }
    if (prevBtn) {
      prevBtn.style.visibility = activeItems.length > 1 ? "visible" : "hidden";
      prevBtn.disabled = activeIdx === 0;
    }
    if (nextBtn) {
      nextBtn.style.visibility = activeItems.length > 1 ? "visible" : "hidden";
      nextBtn.disabled = activeIdx === activeItems.length - 1;
    }

    if (typeof syncCallback === "function") {
      syncCallback(activeIdx);
    }
  }

  function close() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }

  function open(items, startIdx, onIndexChange) {
    if (!lightbox) return;
    activeItems = items;
    syncCallback = onIndexChange || null;
    render(startIdx);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }

  if (closeBtn) closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", () => render(activeIdx - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => render(activeIdx + 1));

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === stageEl) {
        close();
      }
    });
  }

  if (stageEl) {
    stageEl.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true },
    );

    stageEl.addEventListener(
      "touchend",
      (e) => {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(deltaX) > 40) {
          render(deltaX < 0 ? activeIdx + 1 : activeIdx - 1);
        }
      },
      { passive: true },
    );
  }

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("open")) return;
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowLeft") {
      render(activeIdx - 1);
    } else if (e.key === "ArrowRight") {
      render(activeIdx + 1);
    }
  });

  return { open, close };
}

/* ==========================================================================
   6. Modal do Teste Fechado (Google Sheets + LocalStorage)
   ========================================================================== */
function initBetaModal() {
  const modal = document.getElementById("download-modal");
  const openBtns = document.querySelectorAll('[data-open-modal="download"]');
  const closeBtn = document.getElementById("modal-close-btn");
  const emailInput = document.getElementById("modal-beta-email");
  const modalVentuImg = document.getElementById("modal-ventu-img");
  const form = document.getElementById("beta-signup-form");

  if (!modal) return;

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 140);
    }
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector(".beta-submit-btn");
      const feedback = form.querySelector(".beta-form-feedback");
      if (!emailInput || !emailInput.value.trim()) return;

      const email = emailInput.value.trim();

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<span>Enviando...</span>";
      }

      if (
        GOOGLE_SHEETS_WEBAPP_URL &&
        GOOGLE_SHEETS_WEBAPP_URL.startsWith("http")
      ) {
        try {
          await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({
              email,
              origem: "Apresentação Executiva",
              dataHora: new Date().toLocaleString("pt-BR"),
              userAgent: navigator.userAgent,
            }),
          });
        } catch (err) {
          console.error("Erro ao enviar para o Google Sheets:", err);
        }
      }

      try {
        const saved = JSON.parse(
          localStorage.getItem("inspiracao_beta_emails") || "[]",
        );
        if (!saved.includes(email)) {
          saved.push(email);
          localStorage.setItem("inspiracao_beta_emails", JSON.stringify(saved));
        }
      } catch (_) {
        // Ignora bloqueio de storage
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "<span>✓ Na lista de pré-acesso</span>";
      }

      if (feedback) {
        feedback.textContent = `Você está na lista! Enviaremos o convite para ${email} assim que abrirmos a turma.`;
        feedback.classList.add("visible");
      }

      if (modalVentuImg) {
        modalVentuImg.src = "./assets/images/opt/ventu-festa.webp";
      }

      emailInput.value = "";
    });
  }
}
