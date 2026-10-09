// Interatividade do Website - Case UX Analytics: Onboarding do Duolingo
// Atualizado com padrões de acessibilidade WCAG 2.2 Nível AA

document.addEventListener('DOMContentLoaded', () => {
  // 1. Barra de Progresso de Leitura no Topo
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + '%';
    });
  }

  // 2. Animação de Entrada e Contadores Dinâmicos
  // Respeita preferência do usuário por movimento reduzido (WCAG 2.3.3)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('[data-target]');

  if (prefersReducedMotion) {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const isDecimal = counter.getAttribute('data-decimal') === 'true';
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.innerText = isDecimal ? target.toFixed(1) + suffix : target.toLocaleString('pt-BR') + suffix;
    });
  } else {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = +counter.getAttribute('data-target');
          const isDecimal = counter.getAttribute('data-decimal') === 'true';
          const suffix = counter.getAttribute('data-suffix') || '';
          
          let count = 0;
          const inc = target / 40;

          const updateCount = () => {
            count += inc;
            if (count < target) {
              counter.innerText = isDecimal ? count.toFixed(1) + suffix : Math.ceil(count).toLocaleString('pt-BR') + suffix;
              setTimeout(updateCount, 25);
            } else {
              counter.innerText = isDecimal ? target.toFixed(1) + suffix : target.toLocaleString('pt-BR') + suffix;
            }
          };

          updateCount();
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => countObserver.observe(c));
  }

  // 3. WAI-ARIA Tabs: Alternância no Comparador de Protótipos (Versão A vs Versão B)
  const tabA = document.getElementById('tab-version-a');
  const tabB = document.getElementById('tab-version-b');
  const contentA = document.getElementById('content-version-a');
  const contentB = document.getElementById('content-version-b');

  function switchTab(targetTab) {
    if (targetTab === 'a') {
      tabA.classList.add('bg-green-600', 'text-white', 'shadow-md');
      tabA.classList.remove('bg-white', 'text-slate-700', 'border');
      tabA.setAttribute('aria-selected', 'true');
      tabA.setAttribute('tabindex', '0');

      tabB.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
      tabB.classList.add('bg-white', 'text-slate-700', 'border');
      tabB.setAttribute('aria-selected', 'false');
      tabB.setAttribute('tabindex', '-1');

      contentA.classList.remove('hidden');
      contentB.classList.add('hidden');
      tabA.focus();
    } else {
      tabB.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      tabB.classList.remove('bg-white', 'text-slate-700', 'border');
      tabB.setAttribute('aria-selected', 'true');
      tabB.setAttribute('tabindex', '0');

      tabA.classList.remove('bg-green-600', 'text-white', 'shadow-md');
      tabA.classList.add('bg-white', 'text-slate-700', 'border');
      tabA.setAttribute('aria-selected', 'false');
      tabA.setAttribute('tabindex', '-1');

      contentB.classList.remove('hidden');
      contentA.classList.add('hidden');
      tabB.focus();
    }
  }

  if (tabA && tabB && contentA && contentB) {
    tabA.addEventListener('click', () => switchTab('a'));
    tabB.addEventListener('click', () => switchTab('b'));

    // Navegação por teclado com setas direcionais (WAI-ARIA Tabs pattern)
    [tabA, tabB].forEach(tab => {
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          if (tab === tabA) {
            switchTab('b');
          } else {
            switchTab('a');
          }
        }
      });
    });
  }

  // 4. Modais Acessíveis (WCAG 2.2 — Critérios 2.1.2 e 4.1.2)
  // Nota: Os botões de Planilha e FigJam agora abrem diretamente as URLs externas do Google Sheets e Figma.

  function setupAccessibleModal(triggerId, modalId, closeBtnId) {
    const trigger = document.getElementById(triggerId);
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeBtnId);

    if (!trigger || !modal) return;

    let previousActiveElement = null;

    function openModal() {
      previousActiveElement = document.activeElement;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Foco automático no botão de fechar ou primeiro elemento focável
      setTimeout(() => {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
          focusable[0].focus();
        }
      }, 50);

      document.addEventListener('keydown', handleKeyDown);
    }

    function closeModal() {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);

      // Retornar o foco ao elemento que abriu o modal (WCAG 2.4.3)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    }

    function handleKeyDown(e) {
      // 1. Fechar ao pressionar ESC (WCAG 2.1.1)
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
        return;
      }

      // 2. Focus Trap dentro do modal (WCAG 2.1.2)
      if (e.key === 'Tab') {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    // Fechar ao clicar no backdrop escuro
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // 5. Interação Acessível no Funil (Mouse, Toque e Teclado)
  const funnelSteps = document.querySelectorAll('.funnel-step-item');
  const funnelDetailBox = document.getElementById('funnel-detail-text');

  if (funnelSteps.length && funnelDetailBox) {
    funnelSteps.forEach(step => {
      const showDetail = () => {
        const detail = step.getAttribute('data-detail');
        if (detail) {
          funnelDetailBox.innerHTML = detail;
        }
      };

      step.addEventListener('mouseenter', showDetail);
      step.addEventListener('focus', showDetail);
      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDetail();
        }
      });
    });
  }

  // 6. Smooth Scroll para navegação por âncoras (com foco acessível)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });

          // Mover foco programaticamente para o destino para leitores de tela
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      }
    });
  });
});
