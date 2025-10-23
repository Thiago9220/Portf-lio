// Immersion mode: visual toggle + WebAudio ambient (lofi/synth/happy)
(function () {
  const BODY = document.body;
  const PREF_KEY = 'immersion-mode';
  const PREF_TRACK = 'immersion-track';
  const PREF_VOL = 'immersion-volume';
  const PREF_MUTED = 'immersion-muted';

  const headerBtn = document.getElementById('immersion-toggle');
  const mobileBtn = document.getElementById('immersion-toggle-mobile');

  let enabled = false;
  let autoStartPending = false;
  let controls;
  let volInput;
  let muteBtn;
  let trackLofiBtn;
  let trackSynthBtn;
  let trackHappyBtn;

  const synth = {
    ctx: null,
    master: null,
    filter: null,
    delay: null,
    fb: null,
    timer: null,
    idx: 0,
    track: 'synth',
    noise: null,
    lfo: null,
    lfoGain: null,
    intervalMs: 2400,
    ensure() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const master = ctx.createGain();
      master.gain.value = Number(localStorage.getItem(PREF_VOL) || 0.18);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.6;
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.26;
      const fb = ctx.createGain();
      fb.gain.value = 0.18;
      const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      noise.loop = true;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.0;
      noise.connect(noiseGain).connect(filter);
      noise.start();
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.25;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.0;
      lfo.connect(lfoGain).connect(master.gain);
      lfo.start();
      filter.connect(delay);
      delay.connect(fb);
      fb.connect(delay);
      filter.connect(master);
      delay.connect(master);
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.filter = filter;
      this.delay = delay;
      this.fb = fb;
      this.noise = noiseGain;
      this.lfo = lfo;
      this.lfoGain = lfoGain;
      this.setTrack(localStorage.getItem(PREF_TRACK) || 'synth');
    },
    midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },
    playChord() {
      if (!this.ctx) return;
      const TRACK = this.track;
      let CHORDS = [];
      if (TRACK === 'lofi') {
        CHORDS = [
          [57, 60, 64, 67], // Am7
          [55, 59, 62, 65], // G7sus
          [52, 55, 59, 62], // Em7
          [60, 64, 67, 71], // Cmaj7
        ];
      } else if (TRACK === 'happy') {
        CHORDS = [
          [60, 64, 67, 72], // C
          [67, 71, 74, 79], // G
          [69, 72, 76, 81], // A minor
          [65, 69, 72, 77], // F
        ]; // I–V–vi–IV
      } else {
        CHORDS = [
          [60, 64, 67, 72], // C
          [65, 69, 72, 77], // F
          [67, 71, 74, 79], // G
          [60, 64, 67, 72], // C
        ]; // I–IV–V–I
      }
      const now = this.ctx.currentTime;
      const chord = CHORDS[this.idx++ % CHORDS.length];
      chord.forEach((m, i) => {
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        const useSine = this.track === 'lofi';
        const useSquare = this.track !== 'lofi';
        osc.type = useSine ? 'sine' : (i % 2 ? (useSquare ? 'square' : 'triangle') : 'sawtooth');
        osc.frequency.value = this.midiToFreq(m);
        const det = this.track === 'happy' ? 1.5 : (useSine ? 2 : 4);
        osc.detune.value = (Math.random() * 2 - 1) * det;
        env.gain.setValueAtTime(0.0001, now);
        if (this.track === 'lofi') {
          env.gain.linearRampToValueAtTime(0.18, now + 1.0 + i * 0.05);
          env.gain.linearRampToValueAtTime(0.0, now + 3.6 + i * 0.08);
        } else if (this.track === 'happy') {
          env.gain.linearRampToValueAtTime(0.22, now + 0.18 + i * 0.015);
          env.gain.linearRampToValueAtTime(0.0, now + 1.3 + i * 0.04);
        } else {
          env.gain.linearRampToValueAtTime(0.20, now + 0.25 + i * 0.02);
          env.gain.linearRampToValueAtTime(0.0, now + 1.6 + i * 0.05);
        }
        osc.connect(env);
        env.connect(this.filter);
        osc.start(now + (this.track === 'happy' ? i * 0.015 : i * 0.02));
        const stopAt = this.track === 'lofi' ? 4.5 : (this.track === 'happy' ? 1.7 : 2.1);
        osc.stop(now + stopAt);
      });
    },
    setTrack(t) {
      this.track = t === 'lofi' ? 'lofi' : (t === 'happy' ? 'happy' : 'synth');
      if (!this.filter) return;
      const now = this.ctx.currentTime;
      if (this.track === 'lofi') {
        this.filter.frequency.setTargetAtTime(900, now, 0.2);
        this.noise.gain.setTargetAtTime(0.02, now, 0.5);
        this.lfoGain.gain.setTargetAtTime(0.02, now, 0.5);
        this.intervalMs = 4000;
      } else if (this.track === 'happy') {
        this.filter.frequency.setTargetAtTime(3000, now, 0.2);
        this.noise.gain.setTargetAtTime(0.0, now, 0.3);
        this.lfoGain.gain.setTargetAtTime(0.0, now, 0.3);
        this.intervalMs = 2000;
      } else {
        this.filter.frequency.setTargetAtTime(2200, now, 0.2);
        this.noise.gain.setTargetAtTime(0.0, now, 0.3);
        this.lfoGain.gain.setTargetAtTime(0.0, now, 0.3);
        this.intervalMs = 2400;
      }
    },
    start() {
      this.ensure();
      if (!this.ctx) return;
      this.ctx.resume();
      if (this.timer) clearInterval(this.timer);
      this.playChord();
      this.timer = setInterval(() => this.playChord(), this.intervalMs);
    },
    stop() {
      if (!this.ctx) return;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      try { this.ctx.suspend(); } catch {}
    },
  };

  function applyVisual(state) {
    BODY.classList.toggle('immersion-mode', state);
    headerBtn && headerBtn.setAttribute('aria-pressed', String(state));
    if (controls) controls.classList.toggle('hidden', !state);
  }
  function enable() {
    enabled = true;
    localStorage.setItem(PREF_KEY, 'on');
    applyVisual(true);
    if (localStorage.getItem(PREF_MUTED) !== 'on') synth.start();
  }
  function disable() {
    enabled = false;
    localStorage.setItem(PREF_KEY, 'off');
    applyVisual(false);
    synth.stop();
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
  document.addEventListener('visibilitychange', () => {
    if (!synth.ctx) return;
    if (document.hidden) synth.stop();
    else if (enabled && localStorage.getItem(PREF_MUTED) !== 'on') synth.start();
  });

  function buildControls() {
    controls = document.getElementById('immersion-controls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'immersion-controls';
      controls.className = 'hidden fixed bottom-20 right-4 md:right-6 bg-black/60 backdrop-blur-md border border-fuchsia-500/30 rounded-xl p-3 shadow-2xl text-xs text-gray-200 z-50';
      controls.innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="text-fuchsia-300 font-semibold">Imersão</span>
        <span class="ml-2 text-[10px] text-gray-400">(M alterna)</span>
      </div>
      <div class="flex items-center gap-2">
        <button id="imm-mute" class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700 text-gray-200" aria-label="Ativar/Desativar som">
          <i data-lucide="volume-2" class="w-4 h-4"></i>
        </button>
        <input id="imm-vol" type="range" min="0" max="1" step="0.01" class="w-32 accent-fuchsia-500" aria-label="Volume">
        <div class="ml-2 inline-flex bg-gray-800/70 rounded-md border border-gray-700">
          <button id="imm-track-lofi" class="px-2 py-1 rounded-l-md" aria-label="Trilha Lo-fi">Lo-fi</button>
          <button id="imm-track-synth" class="px-2 py-1" aria-label="Trilha Synth">Synth</button>
          <button id="imm-track-happy" class="px-2 py-1 rounded-r-md" aria-label="Trilha Happy">Happy</button>
        </div>
      </div>`;
      document.body.appendChild(controls);
    }
    if (controls.dataset && controls.dataset.wired === '1') return;
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    volInput = controls.querySelector('#imm-vol');
    muteBtn = controls.querySelector('#imm-mute');
    trackLofiBtn = controls.querySelector('#imm-track-lofi');
    trackSynthBtn = controls.querySelector('#imm-track-synth');
    trackHappyBtn = controls.querySelector('#imm-track-happy');

    const savedVol = Number(localStorage.getItem(PREF_VOL) || 0.18);
    volInput.value = String(savedVol);
    const savedTrack = localStorage.getItem(PREF_TRACK) || 'synth';
    setTrackButtons(savedTrack);
    if (localStorage.getItem(PREF_MUTED) === 'on') setMutedUI(true);

    volInput.addEventListener('input', () => {
      const v = Number(volInput.value || 0);
      localStorage.setItem(PREF_VOL, String(v));
      synth.ensure();
      if (synth.master) synth.master.gain.value = v;
      if (v > 0) { setMutedUI(false); localStorage.setItem(PREF_MUTED, 'off'); }
    });
    muteBtn.addEventListener('click', () => {
      const currentlyMuted = localStorage.getItem(PREF_MUTED) === 'on';
      setMutedUI(!currentlyMuted);
      if (!currentlyMuted) {
        localStorage.setItem(PREF_MUTED, 'on');
        synth.stop();
      } else {
        localStorage.setItem(PREF_MUTED, 'off');
        if (enabled) synth.start();
      }
    });
    trackLofiBtn.addEventListener('click', () => switchTrack('lofi'));
    trackSynthBtn.addEventListener('click', () => switchTrack('synth'));
    trackHappyBtn.addEventListener('click', () => switchTrack('happy'));
    if (controls.dataset) controls.dataset.wired = '1';
  }

  function setMutedUI(muted) {
    const icon = muteBtn.querySelector('i');
    icon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function setTrackButtons(t) {
    trackLofiBtn.className = 'px-2 py-1 rounded-l-md ' + (t === 'lofi' ? 'bg-fuchsia-600 text-white' : 'text-gray-300 hover:bg-gray-700/60');
    trackSynthBtn.className = 'px-2 py-1 ' + (t === 'synth' ? 'bg-fuchsia-600 text-white' : 'text-gray-300 hover:bg-gray-700/60');
    trackHappyBtn.className = 'px-2 py-1 rounded-r-md ' + (t === 'happy' ? 'bg-fuchsia-600 text-white' : 'text-gray-300 hover:bg-gray-700/60');
  }

  function switchTrack(t) {
    localStorage.setItem(PREF_TRACK, t);
    synth.ensure();
    synth.setTrack(t);
    setTrackButtons(t);
  }

  const saved = localStorage.getItem(PREF_KEY);
  buildControls();
  if (saved === 'on') {
    enabled = true;
    applyVisual(true);
    autoStartPending = true;
    const kickoff = () => {
      if (!autoStartPending) return;
      autoStartPending = false;
      enable();
      document.removeEventListener('pointerdown', kickoff);
    };
    document.addEventListener('pointerdown', kickoff, { once: true });
  }
})();
