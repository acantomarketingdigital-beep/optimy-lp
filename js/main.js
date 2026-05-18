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
