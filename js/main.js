/* Optimy — main.js */

// ── Footer year ──────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Smooth scroll for anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    var offset = 20;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

// ── Animated counters ────────────────────────────────
function animateCounter(el) {
  var target = parseInt(el.dataset.target, 10);
  var duration = 1600;
  var start = performance.now();

  function step(now) {
    var elapsed = now - start;
    var progress = Math.min(elapsed / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

var counterEls = document.querySelectorAll('.stats__number');
var countersStarted = false;

function maybeStartCounters() {
  if (countersStarted) return;
  var statsSection = document.querySelector('.stats');
  if (!statsSection) return;
  var rect = statsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.85) {
    countersStarted = true;
    counterEls.forEach(animateCounter);
  }
}

// ── Fade-in on scroll ────────────────────────────────
var fadeEls = document.querySelectorAll(
  '.service-card, .testimonial-card, .stats__item, .form-section__copy, .form-section__card'
);
fadeEls.forEach(function (el) { el.classList.add('fade-in'); });

function revealFadeEls() {
  fadeEls.forEach(function (el) {
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('is-visible');
    }
  });
}

window.addEventListener('scroll', function () {
  maybeStartCounters();
  revealFadeEls();
}, { passive: true });

// Run once on load (elements already in viewport)
maybeStartCounters();
revealFadeEls();

// ── Lead form validation & submission ────────────────
var form = document.getElementById('leadForm');
var successBox = document.getElementById('formSuccess');

function showError(fieldId, msg) {
  var input = document.getElementById(fieldId);
  var errorEl = document.getElementById(fieldId + '-error');
  if (input) input.classList.add('is-error');
  if (errorEl) errorEl.textContent = msg;
}

function clearError(fieldId) {
  var input = document.getElementById(fieldId);
  var errorEl = document.getElementById(fieldId + '-error');
  if (input) input.classList.remove('is-error');
  if (errorEl) errorEl.textContent = '';
}

function clearAllErrors() {
  ['nome', 'empresa', 'email', 'whatsapp'].forEach(clearError);
}

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function formatPhone(input) {
  var v = input.value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 2) {
    input.value = v.length ? '(' + v : '';
  } else if (v.length <= 6) {
    input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2);
  } else if (v.length <= 10) {
    input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6);
  } else {
    input.value = '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
  }
}

var phoneInput = document.getElementById('whatsapp');
if (phoneInput) {
  phoneInput.addEventListener('input', function () { formatPhone(this); });
}

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllErrors();

    var nome = document.getElementById('nome').value.trim();
    var empresa = document.getElementById('empresa').value.trim();
    var email = document.getElementById('email').value.trim();
    var whatsapp = document.getElementById('whatsapp').value.replace(/\D/g, '');

    var valid = true;

    if (nome.length < 2) {
      showError('nome', 'Informe seu nome completo.');
      valid = false;
    }
    if (empresa.length < 2) {
      showError('empresa', 'Informe o nome da empresa.');
      valid = false;
    }
    if (!validateEmail(email)) {
      showError('email', 'Informe um e-mail válido.');
      valid = false;
    }
    if (whatsapp.length < 10) {
      showError('whatsapp', 'Informe um número válido com DDD.');
      valid = false;
    }

    if (!valid) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    var msg =
      'Olá! Vim pelo site da Optimy e gostaria de agendar um Diagnóstico Gratuito.' +
      '%0A%0A*Nome:* ' + encodeURIComponent(nome) +
      '%0A*Empresa:* ' + encodeURIComponent(empresa) +
      '%0A*E-mail:* ' + encodeURIComponent(email) +
      '%0A*WhatsApp:* ' + encodeURIComponent(document.getElementById('whatsapp').value);

    setTimeout(function () {
      form.hidden = true;
      successBox.hidden = false;
      window.open('https://wa.me/5511954245000?text=' + msg, '_blank');
    }, 800);
  });

  // Clear individual field errors on input
  ['nome', 'empresa', 'email', 'whatsapp'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () { clearError(id); });
  });
}

// ── Popup de boas-vindas (Banner 1 → Banner 2) ───────
(function () {
  var overlay = document.getElementById('popupOverlay');
  var banner1 = document.getElementById('popupBanner1');
  var banner2 = document.getElementById('popupBanner2');
  var closeBtn = document.getElementById('popupClose');
  var cta1 = document.getElementById('popupCta1');
  var cta2 = document.getElementById('popupCta2');
  if (!overlay || !banner1 || !banner2 || !closeBtn) return;

  var switchTimer = null;
  var autoCloseTimer = null;

  function pushEvent(eventName) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName });
  }

  function hidePopup() {
    clearTimeout(switchTimer);
    clearTimeout(autoCloseTimer);
    overlay.classList.remove('is-visible');
    setTimeout(function () { overlay.hidden = true; }, 300);
  }

  function closePopup() {
    pushEvent('popup_close');
    hidePopup();
  }

  function showBanner2() {
    pushEvent('popup_view_banner2');
    banner1.classList.add('is-leaving');

    setTimeout(function () {
      banner1.hidden = true;
      banner1.classList.remove('is-leaving');
      banner2.hidden = false;
      requestAnimationFrame(function () {
        banner2.classList.add('is-active');
      });
    }, 350);

    autoCloseTimer = setTimeout(closePopup, 8000);
  }

  function openPopup() {
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });
    pushEvent('popup_view_banner1');
    switchTimer = setTimeout(showBanner2, 8000);
  }

  closeBtn.addEventListener('click', closePopup);

  if (cta1) {
    cta1.addEventListener('click', function () {
      pushEvent('popup_cta_click');
      hidePopup();
    });
  }
  if (cta2) {
    cta2.addEventListener('click', function () {
      pushEvent('popup_cta_click');
      hidePopup();
    });
  }

  setTimeout(openPopup, 1500);
})();
