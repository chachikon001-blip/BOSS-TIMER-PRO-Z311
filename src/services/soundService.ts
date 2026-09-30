class SoundService {
  private audioCtx: AudioContext | null = null;
  private ttsVoices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.ttsVoices = window.speechSynthesis.getVoices();
      if (this.ttsVoices.length > 0) {
        this.voicesLoaded = true;
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Play an alert chime sound with Web Audio API synthesizer
   */
  public playChime(type: 'warning' | 'spawn' | 'kill' | 'test' = 'warning', volume: number = 0.8) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.001, now);

      if (type === 'spawn') {
        // Epic double fanfare chime
        gainNode.gain.exponentialRampToValueAtTime(Math.min(1, volume * 0.8), now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880.00, now + 0.15); // A5
        osc1.frequency.setValueAtTime(1174.66, now + 0.35); // D6

        osc2.frequency.setValueAtTime(293.66, now); // D4
        osc2.frequency.setValueAtTime(440.00, now + 0.15); // A4
        osc2.frequency.setValueAtTime(587.33, now + 0.35); // D5

        osc1.connect(gainNode);
        osc2.connect(gainNode);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.85);
        osc2.stop(now + 0.85);
      } else if (type === 'kill') {
        // Quick subtle confirm click/chime
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.5, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        // Warning chime (2-step beep)
        gainNode.gain.exponentialRampToValueAtTime(Math.min(1, volume * 0.7), now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(784, now); // G5
        osc.frequency.setValueAtTime(1046.5, now + 0.12); // C6
        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  /**
   * Speak a text message in Thai or English
   */
  public speak(
    text: string,
    options: {
      volume?: number;
      rate?: number;
      pitch?: number;
      preferThai?: boolean;
    } = {}
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis not supported in this browser');
      return;
    }

    try {
      // Cancel previous speech to prevent lagging audio queue
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = options.volume ?? 0.9;
      utterance.rate = options.rate ?? 1.05; // slightly faster for gaming alerts
      utterance.pitch = options.pitch ?? 1.0;

      // Find appropriate voice
      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      const voices = this.ttsVoices.length > 0 ? this.ttsVoices : window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (options.preferThai !== false) {
        selectedVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('th') || v.lang.toLowerCase().includes('thai')
        );
      }

      if (!selectedVoice) {
        // Fallback to English or default
        selectedVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en')
        );
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'th-TH';
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  /**
   * Play alert sound + voice reading together
   */
  public alertBossEvent(
    bossNameTh: string,
    serverName: string,
    minutesLeft: number,
    options: {
      ttsEnabled?: boolean;
      chimeEnabled?: boolean;
      volume?: number;
      rate?: number;
    } = {}
  ) {
    const isSpawned = minutesLeft <= 0;

    if (options.chimeEnabled !== false) {
      this.playChime(isSpawned ? 'spawn' : 'warning', options.volume ?? 0.8);
    }

    if (options.ttsEnabled !== false) {
      // Give chime 400ms head start
      setTimeout(() => {
        let message = '';
        if (isSpawned) {
          message = `แจ้งเตือน! บอส ${bossNameTh} ${serverName} เกิดแล้วครับ!`;
        } else {
          message = `แจ้งเตือน! บอส ${bossNameTh} ${serverName} กำลังจะเกิดในอีก ${minutesLeft} นาทีครับ!`;
        }
        this.speak(message, {
          volume: options.volume ?? 0.9,
          rate: options.rate ?? 1.1,
          preferThai: true,
        });
      }, 350);
    }
  }
}

export const soundService = new SoundService();
