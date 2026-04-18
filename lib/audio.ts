let audioCtx: AudioContext | null = null;
export const playClickSound = (profile: 'modern' | 'mechanical' | 'soft' = 'modern', volume: number = 1.0) => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (browser policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    if (profile === 'modern') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.3 * volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioCtx.currentTime + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.05);
      
    } else if (profile === 'mechanical') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.05 * volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01 * volume, audioCtx.currentTime + 0.08);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.08);
      
    } else if (profile === 'soft') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15 * volume, audioCtx.currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.01 * volume, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  } catch (e) {
    // Ignore audio errors
  }
};
