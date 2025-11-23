const AudioManager = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let isMuted = false;
    let masterVolume = 0.5;

    // Water splash sound (miss)
    const playWaterSplash = () => {
        if (isMuted) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Create splash sound with filtered noise
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioContext.currentTime);

        gainNode.gain.setValueAtTime(masterVolume * 0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    };

    // Explosion sound (hit)
    const playExplosion = () => {
        if (isMuted) return;

        const bufferSize = audioContext.sampleRate * 0.5;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate explosion noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, audioContext.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(masterVolume * 0.6, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        source.start(audioContext.currentTime);
    };

    // Ship sinking sound (dramatic)
    const playShipSink = () => {
        if (isMuted) return;

        // Multiple explosions
        for (let i = 0; i < 3; i++) {
            setTimeout(() => playExplosion(), i * 150);
        }

        // Deep rumble
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 1);

        gainNode.gain.setValueAtTime(masterVolume * 0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 1);
    };

    // Victory fanfare
    const playVictory = () => {
        if (isMuted) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const duration = 0.3;

        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * duration);

            const startTime = audioContext.currentTime + index * duration;
            gainNode.gain.setValueAtTime(masterVolume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    };

    // Defeat sound
    const playDefeat = () => {
        if (isMuted) return;

        const notes = [392.00, 349.23, 293.66, 261.63]; // G4, F4, D4, C4 (descending)
        const duration = 0.4;

        notes.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * duration);

            const startTime = audioContext.currentTime + index * duration;
            gainNode.gain.setValueAtTime(masterVolume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    };

    // Background ocean ambience
    const playAmbience = () => {
        if (isMuted) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, audioContext.currentTime);

        gainNode.gain.setValueAtTime(masterVolume * 0.05, audioContext.currentTime);

        oscillator.start(audioContext.currentTime);

        // Return stop function
        return () => oscillator.stop();
    };

    // Click sound for UI interactions
    const playClick = () => {
        if (isMuted) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

        gainNode.gain.setValueAtTime(masterVolume * 0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    return {
        playMiss: playWaterSplash,
        playHit: playExplosion,
        playSink: playShipSink,
        playVictory,
        playDefeat,
        playAmbience,
        playClick,
        setVolume: (volume) => {
            masterVolume = Math.max(0, Math.min(1, volume));
        },
        toggleMute: () => {
            isMuted = !isMuted;
            return isMuted;
        },
        isMuted: () => isMuted,
        getVolume: () => masterVolume
    };
};

export default AudioManager;
