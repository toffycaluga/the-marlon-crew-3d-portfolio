// src/scripts/uiController.js
import {
  getMessages,
  setLang,
  getCurrentLang,
  setView,
  getCurrentView
} from "./i18nState.js";

// ✅ Idiomas soportados (los que existen en tu web)
const SUPPORTED_LANGS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  // { code: "de", label: "Deutsch" },
  // { code: "fr", label: "Français" },
  // { code: "it", label: "Italiano" },
  // { code: "zh", label: "中文" },
];

let panelTimeoutId = null;

/**
 * Acceso seguro a paths profundos
 */
function safeGet(obj, path, fallback) {
  return (
    path
      .split(".")
      .reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj) ??
    fallback
  );
}

/**
 * Aplica textos traducidos a toda la UI
 */
function applyLanguageToUI() {
  const T = getMessages() ?? {};
  const buttonsT = T.buttons ?? {};
  const viewsT = T.views ?? {};
  const contactT = T.contact ?? {};
  const form = contactT.form ?? {};
  const extra = contactT.extra ?? {};
  const events = contactT.eventTypes ?? {};

  const btnMap = {
    center: document.querySelector('[data-view="center"]'),
    trapecio: document.querySelector('[data-view="trapecio"]'),
    publico: document.querySelector('[data-view="publico"]'),
    entrada: document.querySelector('[data-view="entrada"]'),
    vestidores: document.querySelector('[data-view="vestidores"]'),
    equipos: document.querySelector('[data-view="equipos"]'),
    utileria: document.querySelector('[data-view="utileria"]'),
    contacto: document.querySelector('[data-view="contacto"]'),
    languages: document.querySelector('[data-view="languages"]'),
  };

  // ===== Botones =====
  if (btnMap.center) btnMap.center.textContent = buttonsT.center ?? "Center";
  if (btnMap.trapecio) btnMap.trapecio.textContent = buttonsT.trapecio ?? "Trapeze";
  if (btnMap.publico) btnMap.publico.textContent = buttonsT.publico ?? "Audience";
  if (btnMap.entrada) btnMap.entrada.textContent = buttonsT.entrada ?? "Entrance";
  if (btnMap.vestidores) btnMap.vestidores.textContent = buttonsT.vestidores ?? "Backstage";
  if (btnMap.equipos) btnMap.equipos.textContent = buttonsT.equipos ?? "Equipment";
  if (btnMap.utileria) btnMap.utileria.textContent = buttonsT.utileria ?? "Props";
  if (btnMap.contacto) btnMap.contacto.textContent = buttonsT.contacto ?? "Contact";
  if (btnMap.languages) btnMap.languages.textContent = buttonsT.languages ?? "Languages";

  // ===== Título / descripción =====
  const currentView = getCurrentView() || "center";
  const viewData = viewsT[currentView] || viewsT.center || {
    title: "",
    description: "",
  };

  const titleEl = document.getElementById("view-title");
  const descEl = document.getElementById("view-description");

  if (titleEl) titleEl.textContent = viewData.title ?? "";
  if (descEl) descEl.textContent = viewData.description ?? "";

  // ===== Contacto =====
  const labelName = document.getElementById("label-name");
  const labelEmail = document.getElementById("label-email");
  const labelEvent = document.getElementById("label-event");
  const labelMsg = document.getElementById("label-msg");

  const optShow = document.getElementById("opt-show");
  const optCorp = document.getElementById("opt-corp");
  const optFest = document.getElementById("opt-fest");
  const optOther = document.getElementById("opt-other");

  const msgTextarea = document.getElementById("contact-message");
  const submitBtn = document.getElementById("submit-btn");

  const extraText = document.getElementById("extra-text");
  const extraPhoneLabel = document.getElementById("extra-phone-label");
  const extraEmailLabel = document.getElementById("extra-email-label");

  if (labelName) labelName.textContent = form.nameLabel ?? "Name";
  if (labelEmail) labelEmail.textContent = form.emailLabel ?? "Email";
  if (labelEvent) labelEvent.textContent = form.eventTypeLabel ?? "Event type";
  if (labelMsg) labelMsg.textContent = form.messageLabel ?? "Message";

  if (optShow) optShow.textContent = events.show ?? "Show";
  if (optCorp) optCorp.textContent = events.corporativo ?? "Corporate";
  if (optFest) optFest.textContent = events.festival ?? "Festival";
  if (optOther) optOther.textContent = events.otro ?? "Other";

  if (msgTextarea) msgTextarea.placeholder = form.messagePlaceholder ?? "";
  if (submitBtn) submitBtn.textContent = form.submit ?? "Send";

  if (extraText) extraText.textContent = extra.alsoText ?? "";
  if (extraPhoneLabel) extraPhoneLabel.textContent = (extra.phoneLabel ?? "Phone") + ":";
  if (extraEmailLabel) extraEmailLabel.textContent = (extra.emailLabel ?? "Email") + ":";
}

/**
 * Marca botón activo (excluye languages)
 */
function setActiveButton(viewName) {
  const buttons = document.querySelectorAll(".view-buttons [data-view]");
  buttons.forEach((btn) => {
    const v = btn.getAttribute("data-view");
    if (!v || v === "languages") return;
    btn.classList.toggle("active", v === viewName);
  });
}

/**
 * Actualiza panel textual + estado
 * ❗ languages es una vista especial
 */
function updatePanel(viewName) {
  if (!viewName || viewName === "languages") return;

  setView(viewName);

  const T = getMessages() ?? {};
  const viewsT = T.views ?? {};
  const viewData = viewsT[viewName] || viewsT.center || {
    title: "",
    description: "",
  };

  const titleEl = document.getElementById("view-title");
  const descEl = document.getElementById("view-description");
  const contactForm = document.getElementById("contact-form");
  const panel = document.getElementById("view-panel");

  if (panel) panel.classList.add("is-updating");

  if (titleEl) titleEl.textContent = viewData.title ?? "";
  if (descEl) descEl.textContent = viewData.description ?? "";

  if (contactForm) {
    contactForm.style.display = viewName === "contacto" ? "flex" : "none";
  }

  setActiveButton(viewName);

  if (panel) {
    if (panelTimeoutId) clearTimeout(panelTimeoutId);
    panelTimeoutId = setTimeout(() => {
      panel.classList.remove("is-updating");
      panelTimeoutId = null;
    }, 150);
  }
}

/**
 * Inicializa toda la UI
 */
export function initUI() {
  const langSelect = document.getElementById("lang-switcher");
  const buttons = document.querySelectorAll(".view-buttons [data-view]");
  const contactForm = document.getElementById("contact-form");

  // ===== Selector de idioma (si existe) =====
  if (langSelect) {
    const current = getCurrentLang();
    langSelect.value = current;

    langSelect.addEventListener("change", (e) => {
      setLang(e.target.value);
      applyLanguageToUI();
      updatePanel(getCurrentView() || "center");
    });
  }

  // ===== Botones de vista =====
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      if (!view) return;

      if (view !== "languages" && window.setThreeView) {
        window.setThreeView(view);
      }

      updatePanel(view);
    });
  });

  // ===== Formulario de contacto =====
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const T = getMessages() ?? {};
      const success = safeGet(
        T,
        "contact.form.successMessage",
        "Sent!"
      );

      const formData = new FormData(contactForm);
      console.log("Contacto enviado:", Object.fromEntries(formData));

      alert(success);
      contactForm.reset();
    });
  }

  // ===== Inicial =====
  applyLanguageToUI();
  updatePanel(getCurrentView() || "center");
}
