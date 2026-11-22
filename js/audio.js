/**
 * ====================================================================
 * BIBI LACOSTE ART — MOTOR DE AUDIO PROCEDURAL (WEB AUDIO API)
 * Síntesis sonora matemática de textura textil, rasgado y resonancias cósmicas
 * ====================================================================
 */

    /* ========================================================
       9. WEB AUDIO PROCEDURAL SOUND SYSTEM
       ======================================================== */
    let audioCtx = null;
    let soundEnabled = true;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function updateSoundBtnText() {
      const btn = document.getElementById('soundBtn');
      if (!btn) return;
      const t = window.t || ((k, f) => f);
      btn.textContent = soundEnabled 
        ? t('intro.soundActive', "Sonido: Textura") 
        : t('intro.soundInactive', "Sonido: Silencio");
    }

    function toggleAudioFeedback() {
      initAudio();
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('soundBtn');
      if (btn) {
        updateSoundBtnText();
        btn.style.borderColor = soundEnabled ? "#D6A46A" : "rgba(163, 150, 134, 0.2)";
      }
    }

    window.addEventListener('languagechange', () => {
      updateSoundBtnText();
    });

    function playBurlapTearSound(step) {
      if (!soundEnabled || !audioCtx) return;

      const bufferSize = audioCtx.sampleRate * 0.35;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650 + step * 180, audioCtx.currentTime);
      filter.Q.setValueAtTime(2.2, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
      noise.stop(audioCtx.currentTime + 0.35);
    }

    function playHarmonicMemoryChime() {
      if (!soundEnabled || !audioCtx) return;

      const chord = [261.63, 329.63, 392.00, 523.25];
      chord.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const startTime = audioCtx.currentTime + idx * 0.09;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 2.25);
      });
    }

    function playCosmosTransitionSound() {
      if (!soundEnabled || !audioCtx) return;

      const bufferSize = audioCtx.sampleRate * 2.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(850, audioCtx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 2.4);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
      noise.stop(audioCtx.currentTime + 2.5);

      const drone = audioCtx.createOscillator();
      const droneGain = audioCtx.createGain();
      drone.type = 'triangle';
      drone.frequency.setValueAtTime(65.4, audioCtx.currentTime);
      drone.frequency.linearRampToValueAtTime(98.0, audioCtx.currentTime + 1.8);

      droneGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1.0);
      droneGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.4);

      drone.connect(droneGain);
      droneGain.connect(audioCtx.destination);
      drone.start();
      drone.stop(audioCtx.currentTime + 2.5);
    }

    function playFragmentChime(idx) {
      if (!soundEnabled || !audioCtx) return;

      const notes = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const freq = notes[idx % notes.length];

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.038, audioCtx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.65);
    }


    // 3. Audio Synthesis for Phase 3
    function playMagneticThudSound() {
      if (!soundEnabled || !audioCtx) return;
      initAudio();
      const t = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, t);
      filter.frequency.exponentialRampToValueAtTime(40, t + 1.2);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(t);
      osc.stop(t + 1.9);
    }

    function playPaperImpactSound(layer) {
      if (!soundEnabled || !audioCtx) return;
      initAudio();
      const t = audioCtx.currentTime;

      const bufSize = Math.floor(audioCtx.sampleRate * 0.12);
      const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350 + layer * 180, t);
      filter.Q.setValueAtTime(3.0, t);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start(t);
      noise.stop(t + 0.15);
    }

    function playHarmonicResolutionChord() {
      if (!soundEnabled || !audioCtx) return;
      initAudio();
      const t = audioCtx.currentTime;

      // Chord frequencies: D Major (D3, A3, F#4, A4, D5)
      const freqs = [146.83, 220.00, 369.99, 440.00, 587.33];
      freqs.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const startDelay = idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + startDelay);

        gain.gain.setValueAtTime(0.001, t + startDelay);
        gain.gain.linearRampToValueAtTime(0.12 / (idx + 1), t + startDelay + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + startDelay + 4.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(t + startDelay);
        osc.stop(t + startDelay + 4.3);
      });
    }

