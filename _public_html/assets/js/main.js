const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');
let scrollRafPending = false;
function updateScrollUI() {
  if (window.scrollY > 50) navbar.classList.add('navbar-scrolled');
  else navbar.classList.remove('navbar-scrolled');
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('text-primary-600');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('text-primary-600');
    }
  });
}
window.addEventListener('scroll', () => {
  if (!scrollRafPending) {
    scrollRafPending = true;
    requestAnimationFrame(() => {
      updateScrollUI();
      scrollRafPending = false;
    });
  }
}, { passive: true });
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateScrollUI);
} else {
  updateScrollUI();
}

const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuIcon = document.getElementById('menuIcon');
let menuOpen = false;

menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('open');
  if (menuOpen) {
    menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
  } else {
    menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
  }
});

document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    menuIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
  });
});

const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('active');
      }, index * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});
revealElements.forEach(el => revealObserver.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 24;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'engagement',
        event_label: 'whatsapp_click'
      });
    }
    if (typeof snaptr === 'function') {
      snaptr('track', 'CONTACT', { method: 'whatsapp' });
    }
  });
});

document.querySelectorAll('a[href^="tel:"]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'engagement',
        event_label: 'phone_click'
      });
    }
    if (typeof snaptr === 'function') {
      snaptr('track', 'CONTACT', { method: 'phone' });
    }
  });
});

(function () {
  var LEAD_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxyrdKe10c8JBwvZHafCq31GCMOdk3l-kT2oQuBF4IXdM76Ow7YBkRsUbgs-UqR9S9IBg/exec';

  var form = document.getElementById('heroLeadForm');
  var modal = document.getElementById('leadThankModal');
  var errEl = document.getElementById('leadFormError');
  var submitBtn = document.getElementById('heroLeadSubmit');
  if (!form || !modal) return;

  function showError(msg) {
    if (!errEl) return;
    errEl.textContent = msg || '';
    errEl.classList.toggle('hidden', !msg);
  }

  function openModal() {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');

    var hp = form.querySelector('[name="lead_hp_url"]');
    if (hp && hp.value) {
      showError('تعذر الإرسال.');
      return;
    }

    var fd = new FormData(form);
    var payload = {
      customer_name: String(fd.get('customer_name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      job_title: String(fd.get('job_title') || '').trim(),
      salary: String(fd.get('salary') || '').trim(),
      mortgage_commitment: String(fd.get('mortgage_commitment') || '').trim()
    };

    if (!payload.customer_name || !payload.email || !payload.phone || !payload.job_title || !payload.salary || !payload.mortgage_commitment) {
      showError('يرجى تعبئة جميع الحقول المطلوبة.');
      return;
    }

    var prevText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.textContent = 'جاري الإرسال…';
    }

    fetch(LEAD_FORM_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.text().then(function (text) {
          var data = null;
          try {
            data = text ? JSON.parse(text) : null;
          } catch (parseErr) {
            data = null;
          }
          if (data && typeof data.success === 'boolean') {
            if (!data.success) {
              var errMsg = data.error || data.message || 'تعذر الإرسال.';
              throw new Error(typeof errMsg === 'string' ? errMsg : 'تعذر الإرسال.');
            }
            return data;
          }
          throw new Error('استجابة غير متوقعة من الخادم.');
        });
      })
      .then(function () {
        openModal();
        form.reset();
        if (typeof snaptr === 'function') {
          snaptr('track', 'SIGN_UP');
        }
      })
      .catch(function (err) {
        showError(err.message || 'تعذر الإرسال. تحقق من الاتصال أو حاول لاحقًا.');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
          submitBtn.textContent = prevText || 'إرسال';
        }
      });
  });

  modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
  });
})();

window.addEventListener('load', function () {
  (function (e, t, n) {
    if (e.snaptr) return;
    var a = (e.snaptr = function () {
      a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
    });
    a.queue = [];
    var s = 'script';
    var r = t.createElement(s);
    r.async = true;
    r.src = n;
    var u = t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r, u);
  })(window, document, 'https://sc-static.net/scevent.min.js');
  snaptr('init', 'ce79a06e-8a2a-4692-8e54-7b8c92796096');
  snaptr('track', 'PAGE_VIEW');

  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  document.head.appendChild(ga);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
}, { once: true });
