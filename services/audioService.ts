
type AudioState = {
  isPlaying: boolean;
  currentId: string | null;
};

type Listener = (state: AudioState) => void;

class AudioService {
  private audio: HTMLAudioElement;
  private currentId: string | null = null;
  private listeners: Set<Listener> = new Set();
  private stopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.volume = 0.5;
      // Auto-pause when song ends naturally
      this.audio.onended = () => this.pause();
      // Sync state when system pauses (e.g. headphones unplugged)
      this.audio.onpause = () => this.notify();
      this.audio.onplay = () => this.notify();
    } else {
      this.audio = null as any;
    }
  }

  // Play a specific track
  play(id: string, url: string, startTime: number = 0) {
    if (!this.audio) return;

    // If switching tracks, update src
    if (this.currentId !== id) {
      this.currentId = id;
      this.audio.src = url;
      this.audio.currentTime = startTime;
    }

    this.audio.play().catch(e => console.error("Audio play error", e));
    this.resetTimer();
    this.notify();
  }

  // Pause playback
  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.clearTimer();
    this.notify();
  }

  // Toggle playback for a specific post
  toggle(id: string, url: string, startTime: number = 0) {
    if (this.currentId === id && !this.audio.paused) {
      this.pause();
    } else {
      this.play(id, url, startTime);
    }
  }

  // Get current state
  getState(): AudioState {
    if (!this.audio) return { isPlaying: false, currentId: null };
    return {
      isPlaying: !this.audio.paused,
      currentId: this.currentId
    };
  }

  // Subscribe to state changes
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // Send immediate state upon subscription
    listener(this.getState());
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach(l => l(state));
  }

  // 20-second auto-stop timer
  private resetTimer() {
    this.clearTimer();
    this.stopTimer = setTimeout(() => {
      this.pause();
    }, 30000);
  }

  private clearTimer() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
  }
}

export const audioService = new AudioService();
