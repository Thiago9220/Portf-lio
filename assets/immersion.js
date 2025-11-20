
(function () {
  const BODY = document.body;
  const PREF_KEY = 'immersion-mode';

  const headerBtn = document.getElementById('immersion-toggle');
  const mobileBtn = document.getElementById('immersion-toggle-mobile');

  let enabled = false;
  let controls;

  function applyVisual(state) {
    BODY.classList.toggle('immersion-mode', state);
    headerBtn && headerBtn.setAttribute('aria-pressed', String(state));
    if (controls) controls.classList.toggle('hidden', !state);
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
