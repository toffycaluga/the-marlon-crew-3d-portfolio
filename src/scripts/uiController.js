// src/scripts/uiController.js
import {
  getMessages,
  setLang,
  getCurrentLang,
  setView,
  getCurrentView
} from './i18nState.js';

function applyLanguageToUI() {
  const T = getMessages();

  const btns = {
    center: document.querySelector('[data-view="center"]'),
    trapecio: document.querySelector('[data-view="trapecio"]'),
    publico: document.querySelector('[data-view="publico"]'),
    entrada: document.querySelector('[data-view="entrada"]'),
    vestidores: document.querySelector('[data-view="vestidores"]'),
    equipos: document.querySelector('[data-view="equipos"]'),
    utileria: document.querySelector('[data-view="utileria"]'),
    contacto: document.querySelector('[data-view="contacto"]')
  };

  if (btns.center) btns.center.textContent = T.buttons.center;
  if (btns.trapecio) btns.trapecio.textContent = T.buttons.trapecio;
  if (btns.publico) btns.publico.textContent = T.buttons.publico;
  if (btns.entrada) btns.entrada.textContent = T.buttons.entrada;
  if (btns.vestidores) btns.vestidores.textContent = T.buttons.vestidores;
  if (btns.equipos) btns.equipos.textContent = T.buttons.equipos;
  if (btns.utileria) btns.utileria.textContent = T.buttons.utileria;
  if (btns.contacto) btns.contacto.textContent = T.buttons.contacto;

  const currentView = getCurrentView();
  const viewData = T.views[currentView] || T.views.center;

  const titleEl = document.getElementById('view-title');
  const descEl = document.getElementById('view-description');

  if (titleEl) titleEl.textContent = viewData.title;
  if (descEl) descEl.textContent = viewData.description;

  const form = T.contact.form;
  const extra = T.contact.extra;
  const events = T.contact.eventTypes;

  const labelName = document.getElementById('label-name');
  const labelEmail = document.getElementById('label-email');
  const labelEvent = document.getElementById('label-event');
  const labelMsg = document.getElementById('label-msg');

  const optShow = document.getElementById('opt-show');
  const optCorp = document.getElementById('opt-corp');
  const optFest = document.getElementById('opt-fest');
  const optOther = document.getElementById('opt-other');

  const msgTextarea = document.getElementById('contact-message');
  const submitBtn = document.getElementById('submit-btn');

  const extraText = document.getElementById('extra-text');
  const extraPhoneLabel = document.getElementById('extra-phone-label');
  const extraEmailLabel = document.getElementById('extra-email-label');

  if (labelName) labelName.textContent = form.nameLabel;
  if (labelEmail) labelEmail.textContent = form.emailLabel;
  if (labelEvent) labelEvent.textContent = form.eventTypeLabel;
  if (labelMsg) labelMsg.textContent = form.messageLabel;

  if (optShow) optShow.textContent = events.show;
  if (optCorp) optCorp.textContent = events.corporativo;
  if (optFest) optFest.textContent = events.festival;
  if (optOther) optOther.textContent = events.otro;

  if (msgTextarea) msgTextarea.placeholder = form.messagePlaceholder;
  if (submitBtn) submitBtn.textContent = form.submit;

  if (extraText) extraText.textContent = extra.alsoText;
  if (extraPhoneLabel) extraPhoneLabel.textContent = extra.phoneLabel + ':';
  if (extraEmailLabel) extraEmailLabel.textContent = extra.emailLabel + ':';
}

function setActiveButton(viewName) {
  const buttons = document.querySelectorAll('.view-buttons [data-view]');
  buttons.forEach((btn) => {
    if (btn.getAttribute('data-view') === viewName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updatePanel(viewName) {
  setView(viewName);
  const T = getMessages();
  const viewData = T.views[viewName] || T.views.center;

  const titleEl = document.getElementById('view-title');
  const descEl = document.getElementById('view-description');
  const contactForm = document.getElementById('contact-form');
  const panel = document.getElementById('view-panel');

  if (panel) {
    panel.classList.add('is-updating');
  }

  if (titleEl) titleEl.textContent = viewData.title;
  if (descEl) descEl.textContent = viewData.description;

  if (contactForm) {
    contactForm.style.display = viewName === 'contacto' ? 'flex' : 'none';
  }

  setActiveButton(viewName);

  if (panel) {
    setTimeout(() => {
      panel.classList.remove('is-updating');
    }, 150);
  }
}

export function initUI() {
  const langSelect = document.getElementById('lang-switcher');
  const buttons = document.querySelectorAll('.view-buttons [data-view]');
  const contactForm = document.getElementById('contact-form');

  if (langSelect) {
    langSelect.value = getCurrentLang();
    langSelect.addEventListener('change', (e) => {
      setLang(e.target.value);
      applyLanguageToUI();
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      if (!view) return;

      if (window.setThreeView) {
        window.setThreeView(view);
      }
      updatePanel(view);
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const T = getMessages();
      const formData = new FormData(contactForm);
      console.log('Contacto enviado:', Object.fromEntries(formData));
      alert(T.contact.form.successMessage);
      contactForm.reset();
    });
  }

  applyLanguageToUI();
  const initialView = getCurrentView() || 'center';
  updatePanel(initialView);
}
