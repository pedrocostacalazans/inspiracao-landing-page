/**
 * InspirAção — Interactive Experience Engine
 * Pure Vanilla JavaScript (Zero Dependencies, GitHub Pages Ready)
 */

/**
 * URL DO GOOGLE SHEETS (Google Apps Script Web App)
 * Cole abaixo a URL gerada ao implantar seu script na planilha:
 * Exemplo: "https://script.google.com/macros/s/AKfycbx.../exec"
 */
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz88cx3yIOudS7mfprLs88UWT569ZW6gc2feqv1ch7iLDrLeeUu4pgslUapFlIRfaV3/exec";

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-ready");
  initNavbarScroll();
  initSkyParticles();
  initSkyPhaseSwitcher();
  initInteractivePhoneMockup();
  initVentuBreathingAndExpressions();
  initFaqAccordion();
  initModalSystem();
  initScrollReveal();
});

/* ==========================================================================
   1. Navbar Flutuante & Menu Mobile
   ========================================================================== */
function initNavbarScroll() {
  const header = document.getElementById("site-header");
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.getElementById("nav-links");

  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("mobile-open");
      mobileBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

/* ==========================================================================
   2. Motor de Partículas Celestes (SkyParticle Painter)
   ========================================================================== */
let currentSkyPhase = "day";

function initSkyParticles() {
  const canvas = document.getElementById("sky-particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    const hero = canvas.parentElement;
    if (!hero) return;
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    createParticles();
  }

  function createParticles() {
    const count = Math.min(
      55,
      Math.max(18, Math.floor((width * height) / 22000)),
    );
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.85,
      r: Math.random() * 2.4 + 1,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.22 - 0.05,
      alpha: Math.random() * 0.55 + 0.15,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const isNight = currentSkyPhase === "midnight";

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += 0.02;

      if (p.y < -10) p.y = height * 0.85;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const pulse = Math.sin(p.phase) * 0.22;
      const alpha = Math.max(0.08, Math.min(0.85, p.alpha + pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, isNight ? p.r * 0.9 : p.r * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = isNight
        ? `rgba(233, 238, 255, ${alpha})`
        : `rgba(255, 255, 255, ${alpha * 0.65})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  draw();
}

/* ==========================================================================
   3. Seletor das 4 Fases do Céu de 24h (SkyPalette)
   ========================================================================== */
const SKY_CONFIGS = {
  dawn: {
    clock: "06:30",
    greeting: "Olá, Pedro",
    headline: "Próxima dose às 08:00",
    subtitle: "2 doses no plano de hoje.",
    sunLeft: "17%",
    sunTop: "6px",
    node08State: "focused",
    node20State: "pending",
    orbMeta: "2 doses às 08:00",
    orbHint: "Segure para<br />registrar",
    liquidHeight: "78%",
    weekSub: "0 de 1 dias com todas as doses",
    capsuleFillHeight: "14%",
    ventuTitle: "Ventu no Amanhecer (06:30)",
    ventuMessage:
      '"Bom dia! Às 06:30 o sol está nascendo antes do selo das 08:00. Toque no orbe para registrar sua dose!"',
    ventuImg: "./assets/images/ventu-onda.png",
  },
  day: {
    clock: "15:07",
    greeting: "Olá, Pedro",
    headline: "Próxima dose às 20:00",
    subtitle: "1 de 2 doses feitas hoje.",
    sunLeft: "53%",
    sunTop: "-8px",
    node08State: "taken",
    node20State: "focused",
    orbMeta: "2 doses às 20:00",
    orbHint: "Segure para<br />registrar",
    liquidHeight: "64%",
    weekSub: "0 de 1 dias com todas as doses",
    capsuleFillHeight: "46%",
    ventuTitle: "Ventu no Dia Solar (15:07)",
    ventuMessage:
      '"Ar limpo e rotina em dia! A dose das 08:00 já está concluída (✓) e o sol caminha rumo às 20:00."',
    ventuImg: "./assets/images/ventu-boas-vindas.png",
  },
  dusk: {
    clock: "18:24",
    greeting: "Olá, Pedro",
    headline: "Próxima dose às 20:00",
    subtitle: "1 de 2 doses feitas hoje.",
    sunLeft: "65%",
    sunTop: "-2px",
    node08State: "taken",
    node20State: "focused",
    orbMeta: "2 doses às 20:00",
    orbHint: "Segure para<br />registrar",
    liquidHeight: "64%",
    weekSub: "0 de 1 dias com todas as doses",
    capsuleFillHeight: "46%",
    ventuTitle: "Ventu no Entardecer (18:24)",
    ventuMessage:
      '"O entardecer sereno chegou e o sol poente se aproxima do selo das 20:00 no horizonte."',
    ventuImg: "./assets/images/ventu-nuvem.png",
  },
  midnight: {
    clock: "23:00",
    greeting: "Olá, Pedro",
    headline: "Tudo feito por hoje",
    subtitle: "Amanhã, a primeira dose é às 08:00.",
    sunLeft: "86%",
    sunTop: "8px",
    node08State: "taken",
    node20State: "taken",
    orbMeta: "2 doses registradas",
    orbHint: "Dia completo",
    liquidHeight: "42%",
    weekSub: "1 de 1 dias com todas as doses",
    capsuleFillHeight: "100%",
    ventuTitle: "Ventu na Noite Profunda (23:00)",
    ventuMessage:
      '"Noite tranquila com todas as doses feitas (✓) e a lua brilhando no horizonte. Bom descanso!"',
    ventuImg: "./assets/images/ventu-dormindo.png",
  },
};

function setHorizonNodeState(el, state) {
  if (!el) return;
  el.classList.remove("taken", "focused", "pending");
  el.classList.add(state);
  el.textContent = state === "taken" ? "✓" : "";
}

function initSkyPhaseSwitcher() {
  const buttons = document.querySelectorAll(".sky-phase-btn");
  const clockEl = document.getElementById("app-mock-clock");
  const greetingEl = document.getElementById("app-mock-greeting");
  const headlineEl = document.getElementById("app-mock-headline");
  const subEl = document.getElementById("app-mock-sub");
  const sunOrbEl = document.getElementById("horizon-sun-orb");
  const node08El = document.getElementById("node-08h");
  const node20El = document.getElementById("node-20h");
  const orbStockText = document.getElementById("orb-stock-text");
  const orbTapPill = document.getElementById("orb-tap-pill");
  const orbLiquid = document.getElementById("orb-liquid-fill");
  const weekSubEl = document.getElementById("app-week-sub");
  const terCapsuleFill = document.getElementById("ter-capsule-fill");
  const ventuHeroTitle = document.getElementById("ventu-hero-title");
  const ventuHeroText = document.getElementById("ventu-hero-text");
  const ventuHeroImg = document.getElementById("ventu-hero-img");

  window.applySkyPhase = function applySkyPhase(phase) {
    currentSkyPhase = phase;
    document.documentElement.setAttribute("data-sky", phase);

    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.phase === phase);
    });

    const cfg = SKY_CONFIGS[phase];
    if (!cfg) return;

    if (clockEl) clockEl.textContent = cfg.clock;
    if (greetingEl) greetingEl.textContent = cfg.greeting;
    if (headlineEl) headlineEl.textContent = cfg.headline;
    if (subEl) subEl.textContent = cfg.subtitle;
    if (sunOrbEl) {
      sunOrbEl.style.left = cfg.sunLeft;
      sunOrbEl.style.top = cfg.sunTop;
    }

    setHorizonNodeState(node08El, cfg.node08State);
    setHorizonNodeState(node20El, cfg.node20State);

    if (orbStockText) orbStockText.textContent = cfg.orbMeta;
    if (orbTapPill) orbTapPill.innerHTML = cfg.orbHint;
    if (orbLiquid) orbLiquid.style.height = cfg.liquidHeight;
    if (weekSubEl) weekSubEl.textContent = cfg.weekSub;
    if (terCapsuleFill) {
      terCapsuleFill.classList.toggle(
        "complete",
        cfg.capsuleFillHeight === "100%",
      );
      terCapsuleFill.style.height = cfg.capsuleFillHeight;
    }

    if (ventuHeroTitle) ventuHeroTitle.textContent = cfg.ventuTitle;
    if (ventuHeroText) ventuHeroText.textContent = cfg.ventuMessage;
    if (ventuHeroImg) ventuHeroImg.src = cfg.ventuImg;

    window.simulatorDoseCompleted = phase === "midnight";
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.applySkyPhase(btn.dataset.phase);
    });
  });
}

/* ==========================================================================
   4. Mockup Interativo do App (Orbe + Pílula Desfazer + Cápsula Semanal)
   ========================================================================== */
function initInteractivePhoneMockup() {
  const orbBtn = document.getElementById("interactive-orb-btn");
  const orbLiquid = document.getElementById("orb-liquid-fill");
  const orbStockText = document.getElementById("orb-stock-text");
  const orbTapPill = document.getElementById("orb-tap-pill");
  const node08h = document.getElementById("node-08h");
  const node20h = document.getElementById("node-20h");
  const headlineEl = document.getElementById("app-mock-headline");
  const subEl = document.getElementById("app-mock-sub");
  const weekSubEl = document.getElementById("app-week-sub");
  const terCapsuleFill = document.getElementById("ter-capsule-fill");
  const skyUndoPillBtn = document.getElementById("sky-undo-pill-btn");
  const toastEl = document.getElementById("app-mock-toast");
  const toastMsg = document.getElementById("app-toast-msg");
  const toastUndoBtn = document.getElementById("app-toast-undo");
  const reliefBtn = document.getElementById("satellite-relief-btn");
  const immunoBtn = document.getElementById("satellite-immuno-btn");
  const symptomCardBtn = document.getElementById("app-symptom-card-btn");
  const symptomSubEl = document.getElementById("app-symptom-sub");
  const actCardBtn = document.getElementById("app-act-card-btn");
  const ventuHeroImg = document.getElementById("ventu-hero-img");
  const ventuHeroText = document.getElementById("ventu-hero-text");

  window.simulatorDoseCompleted = false;
  let toastTimeout = null;

  function showAppToast(message) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = message;
    toastEl.classList.add("visible");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove("visible");
    }, 4500);
  }

  function triggerLiquidSlosh() {
    if (!orbLiquid) return;
    orbLiquid.classList.add("sloshing");
    setTimeout(() => {
      orbLiquid.classList.remove("sloshing");
    }, 900);
  }

  function completeCurrentDose() {
    window.simulatorDoseCompleted = true;
    setHorizonNodeState(node08h, "taken");
    setHorizonNodeState(node20h, "taken");
    if (orbStockText) orbStockText.textContent = "2 doses registradas";
    if (orbLiquid) {
      triggerLiquidSlosh();
      orbLiquid.style.height = "42%";
    }
    if (orbTapPill) orbTapPill.innerHTML = "Dia completo";
    if (headlineEl) headlineEl.textContent = "Tudo feito por hoje";
    if (subEl) subEl.textContent = "2 de 2 doses feitas hoje.";
    if (weekSubEl) weekSubEl.textContent = "1 de 1 dias com todas as doses";
    if (terCapsuleFill) {
      terCapsuleFill.classList.add("complete");
      terCapsuleFill.style.height = "100%";
    }
    if (ventuHeroImg) ventuHeroImg.src = "./assets/images/ventu-festa.png";
    if (ventuHeroText) {
      ventuHeroText.textContent =
        '"Parabéns! Dose registrada. O nível líquido da orbe desceu consumindo os jatos e o dia ficou completo!"';
    }
    showAppToast("Clenil registrado");
  }

  function undoLastDose() {
    const fallbackPhase =
      currentSkyPhase === "midnight" ? "day" : currentSkyPhase;
    triggerLiquidSlosh();
    if (window.applySkyPhase) {
      window.applySkyPhase(fallbackPhase);
    }
    showAppToast("Registro desfeito");
  }

  if (orbBtn) {
    orbBtn.addEventListener("click", () => {
      if (!window.simulatorDoseCompleted) {
        completeCurrentDose();
      } else {
        undoLastDose();
      }
    });
  }

  if (skyUndoPillBtn) {
    skyUndoPillBtn.addEventListener("click", () => {
      undoLastDose();
    });
  }

  if (toastUndoBtn) {
    toastUndoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      undoLastDose();
      if (toastEl) toastEl.classList.remove("visible");
    });
  }

  if (reliefBtn) {
    reliefBtn.addEventListener("click", () => {
      showAppToast("Alívio registrado às 15:07");
      if (ventuHeroImg)
        ventuHeroImg.src = "./assets/images/ventu-olhos-fechados.png";
      if (ventuHeroText) {
        ventuHeroText.textContent =
          '"Vamos com calma. O uso de alívio foi registrado com horário exato no seu histórico."';
      }
    });
  }

  if (immunoBtn) {
    immunoBtn.addEventListener("click", () => {
      showAppToast("Aplicação de imunobiológico visualizada");
    });
  }

  if (symptomCardBtn) {
    symptomCardBtn.addEventListener("click", () => {
      if (symptomSubEl) {
        symptomSubEl.textContent =
          "Hoje às 15:07: Respiração estável registrada ✓";
      }
      showAppToast("Respiração registrada");
    });
  }

  if (actCardBtn) {
    actCardBtn.addEventListener("click", () => {
      showAppToast("Teste ACT: 23 de 25 pontos (Controlada)");
    });
  }

  // Navegação entre as 3 abas flutuantes (Hoje, Plano, Perfil)
  const navTabs = document.querySelectorAll(".app-nav-tab");
  const screenPanes = document.querySelectorAll(".app-screen-pane");

  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.screen;
      navTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      screenPanes.forEach((pane) => {
        pane.classList.toggle("active", pane.id === `pane-${target}`);
      });
    });
  });
}

/* ==========================================================================
   5. Experiência Guiada "Respire com o Ventu" (4s Inspirar / 4s Expirar)
   ========================================================================== */
function initVentuBreathingAndExpressions() {
  const startBreathBtn = document.getElementById("toggle-breathing-btn");
  const ringContainer = document.getElementById("breathing-ring-container");
  const breathInstruction = document.getElementById("breath-instruction");
  const breathSub = document.getElementById("breath-sub");
  const ventuStageImg = document.getElementById("ventu-stage-img");
  const expressionChips = document.querySelectorAll(".expression-chip");

  let breathingInterval = null;
  let isBreathingActive = false;
  let phase = "inhale";

  function stopBreathingSession() {
    isBreathingActive = false;
    if (breathingInterval) clearInterval(breathingInterval);
    if (ringContainer) {
      ringContainer.classList.remove("inhaling", "exhaling");
    }
    if (startBreathBtn) {
      startBreathBtn.innerHTML = "🌬️ Iniciar Pausa Respiratória (4s / 4s)";
    }
  }

  if (startBreathBtn && ringContainer) {
    startBreathBtn.addEventListener("click", () => {
      if (isBreathingActive) {
        stopBreathingSession();
        breathInstruction.textContent = "Pausa concluída com serenidade";
        breathSub.textContent =
          "Toque em qualquer expressão do Ventu ao lado ou inicie um novo ciclo.";
        ventuStageImg.src = "./assets/images/ventu-boas-vindas.png";
        return;
      }

      isBreathingActive = true;
      startBreathBtn.innerHTML = "⏸️ Pausar Exercício Respiratório";
      ventuStageImg.src = "./assets/images/ventu-olhos-fechados.png";

      const runCycle = () => {
        if (phase === "inhale") {
          ringContainer.classList.remove("exhaling");
          ringContainer.classList.add("inhaling");
          breathInstruction.textContent = "Inspire devagar pelo nariz... (4s)";
          breathSub.textContent =
            "O nariz filtra e aquece o ar, protegendo seus brônquios.";
          phase = "exhale";
        } else {
          ringContainer.classList.remove("inhaling");
          ringContainer.classList.add("exhaling");
          breathInstruction.textContent = "Solte o ar suavemente... (4s)";
          breathSub.textContent =
            "Relaxe os ombros e acompanhe o halo luminoso do Ventu.";
          phase = "inhale";
        }
      };

      phase = "inhale";
      runCycle();
      breathingInterval = setInterval(runCycle, 4000);
    });
  }

  expressionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      stopBreathingSession();
      expressionChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      const imgSrc = chip.dataset.img;
      const title = chip.dataset.title;
      const desc = chip.dataset.desc;

      if (ventuStageImg && imgSrc) {
        ventuStageImg.style.opacity = "0.3";
        ventuStageImg.style.transform = "scale(0.9)";
        setTimeout(() => {
          ventuStageImg.src = imgSrc;
          ventuStageImg.style.opacity = "1";
          ventuStageImg.style.transform = "scale(1)";
        }, 140);
      }
      if (breathInstruction && title) breathInstruction.textContent = title;
      if (breathSub && desc) breathSub.textContent = desc;
    });
  });
}

/* ==========================================================================
   6. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    if (!btn || !answer) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      items.forEach((other) => {
        other.classList.remove("open");
        const otherAns = other.querySelector(".faq-answer");
        if (otherAns) otherAns.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

/* ==========================================================================
   7. Modal de Acesso & Captura de E-mail (Teste Fechado)
   ========================================================================== */
function initModalSystem() {
  const modal = document.getElementById("download-modal");
  const openBtns = document.querySelectorAll('[data-open-modal="download"]');
  const closeBtn = document.getElementById("modal-close-btn");
  const modalInput = document.getElementById("modal-beta-email");
  const modalVentuImg = document.getElementById("modal-ventu-img");

  if (modal) {
    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        if (modalInput) {
          setTimeout(() => modalInput.focus(), 120);
        }
      });
    });

    const closeModal = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });
  }

  // Captura de E-mail em todos os formulários do Teste Fechado -> Google Sheets
  const betaForms = document.querySelectorAll("[data-beta-form]");
  betaForms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector(".beta-email-input");
      const btn = form.querySelector(".beta-submit-btn");
      const feedback = form.querySelector(".beta-form-feedback");

      if (!input || !input.value.trim()) return;
      const email = input.value.trim();

      const origem = form.classList.contains("hero-beta-form")
        ? "Hero (Topo)"
        : form.classList.contains("final-beta-form")
          ? "CTA Final (Rodapé)"
          : "Modal Teste Fechado";

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "<span>Enviando...</span>";
      }

      // 1. Envia para a Planilha do Google Sheets (se a URL estiver configurada)
      if (GOOGLE_SHEETS_WEBAPP_URL && GOOGLE_SHEETS_WEBAPP_URL.startsWith("http")) {
        try {
          await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({
              email,
              origem,
              dataHora: new Date().toLocaleString("pt-BR"),
              userAgent: navigator.userAgent,
            }),
          });
        } catch (err) {
          console.error("Erro ao enviar para o Google Sheets:", err);
        }
      }

      // 2. Salva backup local no navegador
      try {
        const saved = JSON.parse(
          localStorage.getItem("inspiracao_beta_emails") || "[]",
        );
        if (!saved.includes(email)) {
          saved.push(email);
          localStorage.setItem("inspiracao_beta_emails", JSON.stringify(saved));
        }
      } catch (_) {
        // Ignora erro de storage privado
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "<span>✓ E-mail Cadastrado</span>";
      }

      if (feedback) {
        feedback.textContent = `🎉 Perfeito! Anotamos ${email} na lista do Teste Fechado.`;
        feedback.classList.add("visible");
      }

      if (modalVentuImg) {
        modalVentuImg.src = "./assets/images/ventu-festa.png";
      }

      const heroVentuImg = document.getElementById("ventu-hero-img");
      const heroVentuText = document.getElementById("ventu-hero-text");
      if (heroVentuImg) {
        heroVentuImg.src = "./assets/images/ventu-festa.png";
      }
      if (heroVentuText) {
        heroVentuText.textContent = `"Eba! Seu e-mail (${email}) entrou na lista do nosso Teste Fechado. Bem-vindo à InspirAção!"`;
      }

      input.value = "";
    });
  });
}

/* ==========================================================================
   8. Scroll Reveal (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  elements.forEach((el) => observer.observe(el));
}
