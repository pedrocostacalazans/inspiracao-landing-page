/**
 * InspirAção — Apresentação Mobile Executiva
 * Pure Vanilla JavaScript (Zero Dependencies)
 */

const GOOGLE_SHEETS_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbz88cx3yIOudS7mfprLs88UWT569ZW6gc2feqv1ch7iLDrLeeUu4pgslUapFlIRfaV3/exec";

let currentSkyPhase = "day";

document.addEventListener("DOMContentLoaded", () => {
  initSkyParticles();
  initSkyPhaseSwitcher();
  const deckApi = initDeckNavigation();
  const lightboxApi = initScreenLightbox();
  initPhoneCarousels(deckApi, lightboxApi);
  initBetaModal();
});

/* ==========================================================================
   1. Partículas Atmosféricas na Capa (#slide-1)
   ========================================================================== */
function initSkyParticles() {
  const canvas = document.getElementById("sky-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    const host = canvas.parentElement;
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

  function renderFrame() {
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

    if (!reducedMotion) {
      requestAnimationFrame(renderFrame);
    }
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  renderFrame();
}

/* ==========================================================================
   2. Seletor das 4 Fases do Céu 24h (Capa & Encerramento)
   ========================================================================== */
const SKY_CONFIGS = {
  dawn: {
    caption: "Amanhecer · 06:30",
    themeColor: "#45689D",
    ventuImg: "./assets/images/ventu-piscando.png",
  },
  day: {
    caption: "Dia Solar · 15:07",
    themeColor: "#3F70B4",
    ventuImg: "./assets/images/ventu-onda.png",
  },
  dusk: {
    caption: "Entardecer · 18:24",
    themeColor: "#394371",
    ventuImg: "./assets/images/ventu-nuvem.png",
  },
  midnight: {
    caption: "Noite · 23:00",
    themeColor: "#1E2C54",
    ventuImg: "./assets/images/ventu-dormindo.png",
  },
};

function initSkyPhaseSwitcher() {
  const buttons = document.querySelectorAll(".sky-phase-btn");
  const captionEl = document.getElementById("sky-phase-caption");
  const ventuImg = document.getElementById("ventu-hero-img");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyPhase(phase) {
    const cfg = SKY_CONFIGS[phase];
    if (!cfg) return;

    currentSkyPhase = phase;
    document.documentElement.setAttribute("data-sky", phase);

    buttons.forEach((btn) => {
      const isActive = btn.dataset.phase === phase;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    if (captionEl) captionEl.textContent = cfg.caption;
    if (themeMeta) themeMeta.setAttribute("content", cfg.themeColor);
    if (ventuImg && ventuImg.getAttribute("src") !== cfg.ventuImg) {
      ventuImg.style.opacity = "0.25";
      setTimeout(() => {
        ventuImg.src = cfg.ventuImg;
        ventuImg.style.opacity = "1";
      }, 120);
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyPhase(btn.dataset.phase));
  });
}

/* ==========================================================================
   3. Navegação do Deck Vertical (Snap, HUD Adaptativo, Progresso & Teclado)
   ========================================================================== */
function initDeckNavigation() {
  const deck = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".deck-slide"));
  const dots = Array.from(document.querySelectorAll(".deck-dot"));
  const hud = document.getElementById("deck-hud");
  const dotsNav = document.getElementById("deck-dots");
  const counterEl = document.getElementById("hud-counter");
  const progressBar = document.getElementById("deck-progress-bar");

  let activeIndex = 0;

  function preloadSlideImages(index) {
    const slide = slides[index];
    if (!slide) return;
    slide.querySelectorAll("img").forEach((img) => {
      if (img.loading === "lazy") {
        img.loading = "eager";
      }
      const src = img.getAttribute("src");
      if (src && !img.complete) {
        const loader = new Image();
        loader.src = src;
      }
    });
  }

  function setActiveSlide(index) {
    if (index < 0 || index >= slides.length) return;
    activeIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });

    dots.forEach((dot, i) => {
      const isCurrent = i === index;
      dot.classList.toggle("active", isCurrent);
      if (isCurrent) {
        dot.setAttribute("aria-current", "step");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (counterEl) {
      const num = String(index + 1).padStart(2, "0");
      const total = String(slides.length).padStart(2, "0");
      counterEl.textContent = `${num} / ${total}`;
    }

    const hudTheme = slides[index].dataset.hud === "dark" ? "hud-dark" : "hud-light";
    [hud, dotsNav].forEach((el) => {
      if (!el) return;
      el.classList.remove("hud-light", "hud-dark");
      el.classList.add(hudTheme);
    });

    preloadSlideImages(index);
    preloadSlideImages(index + 1);
  }

  function goToSlide(index) {
    if (!deck || slides.length === 0) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    deck.scrollTo({
      top: slides[clamped].offsetTop,
      behavior: "smooth",
    });
  }

  if (deck && slides.length > 0) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const idx = Number(entry.target.dataset.index || 0);
              setActiveSlide(idx);
            }
          });
        },
        { root: deck, threshold: 0.55 },
      );

      slides.forEach((slide) => observer.observe(slide));
    }

    let scrollRaf = null;
    deck.addEventListener(
      "scroll",
      () => {
        if (scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = null;
          const maxScroll = deck.scrollHeight - deck.clientHeight;
          const ratio = maxScroll > 0 ? deck.scrollTop / maxScroll : 0;
          const pct = ((ratio * (slides.length - 1) + 1) / slides.length) * 100;
          if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(100 / slides.length, pct))}%`;
          }
          const approxIndex = Math.round(ratio * (slides.length - 1));
          if (approxIndex !== activeIndex) {
            setActiveSlide(approxIndex);
          }
        });
      },
      { passive: true },
    );
  }

  document.querySelectorAll("[data-goto]").forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      goToSlide(Number(trigger.dataset.goto || 0));
    });
  });

  document.addEventListener("keydown", (e) => {
    const lightboxOpen = document
      .getElementById("screen-lightbox")
      ?.classList.contains("open");
    const modalOpen = document
      .getElementById("download-modal")
      ?.classList.contains("open");
    const activeTag = document.activeElement?.tagName;
    if (
      lightboxOpen ||
      modalOpen ||
      activeTag === "INPUT" ||
      activeTag === "TEXTAREA"
    ) {
      return;
    }

    if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    } else if (e.key === "ArrowRight") {
      slides[activeIndex]?._stepCarousel?.(1);
    } else if (e.key === "ArrowLeft") {
      slides[activeIndex]?._stepCarousel?.(-1);
    }
  });

  setActiveSlide(0);

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
        modalVentuImg.src = "./assets/images/ventu-festa.png";
      }

      emailInput.value = "";
    });
  }
}
