/* ===================================================================
   A7 DIGITAL — LP BLEFAROPLASTIA — SCRIPT
=================================================================== */
document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------------------------------------------
     1. SCROLL REVEAL (data-aos)
  ----------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-aos]');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* -----------------------------------------------------------------
     2. CONTADOR ANIMADO (estatísticas da seção de resultados)
  ----------------------------------------------------------------- */
  var counters = document.querySelectorAll('[data-count]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* -----------------------------------------------------------------
     2.5. MÉTODO ÁGUIA — troca de etapas (nav + painel)
  ----------------------------------------------------------------- */
  var methodNavItems = document.querySelectorAll('.method-nav__item');
  var methodSlides = document.querySelectorAll('.method-panel__slide');
  var methodProgressFill = document.querySelector('.method-panel__progress-fill');
  var methodTotalSteps = methodNavItems.length;

  function goToMethodStep(step) {
    methodNavItems.forEach(function (item) {
      var isActive = item.getAttribute('data-step') === step;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    methodSlides.forEach(function (slide) {
      slide.classList.toggle('is-active', slide.getAttribute('data-step') === step);
    });

    if (methodProgressFill && methodTotalSteps > 0) {
      var stepIndex = parseInt(step, 10) + 1;
      var progress = (stepIndex / methodTotalSteps) * 100;
      methodProgressFill.style.width = progress + '%';
    }
  }

  if (methodNavItems.length && methodSlides.length) {
    methodNavItems.forEach(function (item) {
      item.addEventListener('click', function () {
        goToMethodStep(item.getAttribute('data-step'));
      });
    });
  }

  /* -----------------------------------------------------------------
     3. MÁSCARA SIMPLES DE WHATSAPP
  ----------------------------------------------------------------- */
  var whatsappInput = document.getElementById('whatsapp');
  if (whatsappInput) {
    whatsappInput.addEventListener('input', function (e) {
      var digits = e.target.value.replace(/\D/g, '').slice(0, 11);
      var formatted = digits;
      if (digits.length > 2) formatted = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
      if (digits.length > 7) formatted = '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
      e.target.value = formatted;
    });
  }

  /* -----------------------------------------------------------------
     4. ENVIO DO FORMULÁRIO -> FORMSUBMIT
     -----------------------------------------------------------------
     Envio direto pro parser do Kommo via FormSubmit.
     No PRIMEIRO envio de teste, o FormSubmit manda um e-mail de
     confirmação para o endereço abaixo — alguém com acesso à caixa
     precisa abrir esse e-mail e clicar no link de "ativar".
     Depois desse passo único, os leads passam a cair direto no
     destino normalmente, sem precisar repetir a confirmação.

     >>> TESTE TEMPORÁRIO: trocar para o e-mail comercial, confirmar
     >>> que chega, e só DEPOIS trocar de volta para o parser Kommo.
  ----------------------------------------------------------------- */
  var FORMSUBMIT_EMAIL = '32458931.146440@parser.kommo.com';

  var leadForm = document.getElementById('leadForm');

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = document.getElementById('nome').value.trim();
      var whatsapp = document.getElementById('whatsapp').value.trim();
      var email = document.getElementById('email').value.trim();
      var trafego = document.getElementById('trafego').value;
      var faturamento = document.getElementById('faturamento').value;

      // Validação simples
      if (!nome || !whatsapp || !email || !trafego || !faturamento) {
        leadForm.reportValidity();
        return;
      }

      var submitBtn = leadForm.querySelector('button[type="submit"]');
      var btnText = submitBtn.querySelector('.btn-text');
      var originalText = btnText.textContent;

      submitBtn.disabled = true;
      btnText.textContent = 'Enviando...';

      var payload = new FormData();
      payload.append('Nome', nome);
      payload.append('WhatsApp', whatsapp);
      payload.append('E-mail', email);
      payload.append('Trafego_pago', trafego);
      payload.append('Faturamento_mensal', faturamento);
      payload.append('Origem', 'LP Blefaroplastia A7 Digital');

      // Configurações do FormSubmit (ver docs: https://formsubmit.co)
      payload.append('_subject', 'Novo lead — LP Blefaroplastia A7 Digital');
      payload.append('_template', 'table');
      payload.append('_captcha', 'false');

      fetch('https://formsubmit.co/' + FORMSUBMIT_EMAIL, {
        method: 'POST',
        body: payload,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) { throw new Error('Falha no envio'); }
          showSuccess();
        })
        .catch(function () {
          btnText.textContent = 'Erro ao enviar. Tente novamente.';
          submitBtn.disabled = false;
          setTimeout(function () {
            btnText.textContent = originalText;
          }, 3500);
        });

      function showSuccess() {
        btnText.textContent = 'Recebemos seu contato! ✓';
        leadForm.reset();
        setTimeout(function () {
          submitBtn.disabled = false;
          btnText.textContent = originalText;
        }, 3500);
      }
    });
  }

  /* -----------------------------------------------------------------
     5. NAVBAR/HEADER COM LEVE SOMBRA AO SCROLLAR (opcional, sutil)
  ----------------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 12) {
        header.style.boxShadow = '0 12px 30px -20px rgba(0,0,0,0.6)';
      } else {
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

});