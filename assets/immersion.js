
(function () {
  const BODY = document.body;
  const PREF_KEY = 'immersion-mode';

  const headerBtn = document.getElementById('immersion-toggle');
  const mobileBtn = document.getElementById('immersion-toggle-mobile');

  let enabled = false;
  let controls;
  let typewriterIntervals = [];
  let originalTexts = new Map();
  let heroTypewriterInterval = null;


  const typewriterSelectors = [
    '#bio-text',
    '.project-description',
    '.experience-card .company',
    '.experience-card .role-title'
  ];


  const heroPhrases = [
    'Desenvolvo com propósito.',
    'Transformo dados em decisões.',
    'Crio experiências que sentem.'
  ];

  function startHeroTypewriter() {
    const subtitleEl = document.getElementById('hero-subtitle');
    if (!subtitleEl) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const animateHero = () => {
      if (!enabled) return;

      const currentPhrase = heroPhrases[phraseIndex];

      if (!isDeleting && charIndex <= currentPhrase.length) {
        subtitleEl.textContent = currentPhrase.slice(0, charIndex) + ' ';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '|';
        cursor.style.color = '#d946ef';
        subtitleEl.appendChild(cursor);
        charIndex++;
        setTimeout(animateHero, 70);
      } else if (!isDeleting && charIndex > currentPhrase.length) {
        isDeleting = true;
        setTimeout(animateHero, 1400);
      } else if (isDeleting && charIndex > 0) {
        charIndex--;
        subtitleEl.textContent = currentPhrase.slice(0, charIndex) + ' ';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '|';
        cursor.style.color = '#d946ef';
        subtitleEl.appendChild(cursor);
        setTimeout(animateHero, 40);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % heroPhrases.length;
        setTimeout(animateHero, 250);
      }
    };

    animateHero();
  }

  function stopHeroTypewriter() {
    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = 'Desenvolvedor de Software';
    }
  }

  function startTypewriter(element) {
    if (!element || !element.textContent) return;


    if (!originalTexts.has(element)) {
      originalTexts.set(element, element.textContent);
    }

    const fullText = originalTexts.get(element);
    let currentIndex = 0;
    let isDeleting = false;

    const animate = () => {
      if (!enabled) return;

      if (!isDeleting && currentIndex <= fullText.length) {
        element.textContent = fullText.slice(0, currentIndex);
        currentIndex++;
      } else if (!isDeleting && currentIndex > fullText.length) {

        setTimeout(() => { isDeleting = true; }, 2000);
        return;
      } else if (isDeleting && currentIndex > 0) {
        currentIndex--;
        element.textContent = fullText.slice(0, currentIndex);
      } else if (isDeleting && currentIndex === 0) {

        isDeleting = false;
        setTimeout(animate, 500);
        return;
      }

      const speed = isDeleting ? 20 : 40;
      setTimeout(animate, speed);
    };

    animate();
  }

  function stopAllTypewriters() {
    typewriterIntervals.forEach(interval => clearInterval(interval));
    typewriterIntervals = [];


    originalTexts.forEach((text, element) => {
      if (element) element.textContent = text;
    });
  }

  function initTypewriters() {

    startHeroTypewriter();

    typewriterSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {

        setTimeout(() => startTypewriter(el), index * 300);
      });
    });
  }

  function applyVisual(state) {
    BODY.classList.toggle('immersion-mode', state);
    headerBtn && headerBtn.setAttribute('aria-pressed', String(state));
    if (controls) controls.classList.toggle('hidden', !state);

    if (state) {
      initTypewriters();
    } else {
      stopAllTypewriters();
      stopHeroTypewriter();
    }
  }

  function enable() {
    enabled = true;
    localStorage.setItem(PREF_KEY, 'on');
    applyVisual(true);
  }

  function disable() {
    enabled = false;
    localStorage.setItem(PREF_KEY, 'off');
    applyVisual(false);
  }

  function toggle() { enabled ? disable() : enable(); }

  headerBtn && headerBtn.addEventListener('click', toggle);
  mobileBtn && mobileBtn.addEventListener('click', toggle);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || (document.activeElement && document.activeElement.isContentEditable)) return;
      toggle();
    }
  });

  function buildControls() {
    controls = document.getElementById('immersion-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'immersion-controls';
      controls.className = 'hidden fixed bottom-20 right-4 md:right-6 bg-black/60 backdrop-blur-md border border-fuchsia-500/30 rounded-xl p-3 shadow-2xl text-xs text-gray-200 z-50';
      controls.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-fuchsia-300 font-semibold">Imersão</span>
        <span class="ml-2 text-[10px] text-gray-400">(M alterna)</span>
      </div>`;
      document.body.appendChild(controls);
    }
  }

  const saved = localStorage.getItem(PREF_KEY);
  buildControls();
  if (saved === 'on') {
    enabled = true;
    applyVisual(true);
  }
})();
