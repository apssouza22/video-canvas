import type { CompositionCanvasAPI } from '../src/domains/canvas/compositionCanvasApi';
import { UIComponent } from './core/UIComponent';

function formatTime(seconds: number): string {
  const whole = Math.floor(seconds);
  const fraction = Math.floor((seconds - whole) * 10);
  return `${whole}.${fraction}s`;
}

export class PlaybackControls extends UIComponent {
  private currentTime = 0;
  private playbackStartedAt = 0;
  private isPlaying = false;
  private isScrubbing = false;
  private rafId: number | null = null;
  private lastFrameTimestamp: number | null = null;

  constructor(container: HTMLElement, api: CompositionCanvasAPI) {
    super(container, api);
    this.bind();
  }

  protected createElement(): HTMLElement {
    const bar = document.createElement('div');
    bar.className =
      'absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2.5 w-[min(42rem,calc(100%-2.5rem))] rounded-xl border border-vc-border bg-[rgba(17,21,29,0.92)] shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm';

    const toggleBtn = this.tagRef(document.createElement('button'), 'toggle');
    toggleBtn.type = 'button';
    toggleBtn.className =
      'shrink-0 min-w-[5.5rem] border border-vc-border rounded-lg px-3 py-1.5 bg-[#1f2430] text-vc-text text-sm font-semibold cursor-pointer hover:border-vc-accent hover:bg-[#243149] disabled:opacity-45 disabled:cursor-not-allowed';

    const seek = this.tagRef(document.createElement('input'), 'seek');
    seek.type = 'range';
    seek.min = '0';
    seek.max = '0';
    seek.step = '0.01';
    seek.value = '0';
    seek.className =
      'min-w-0 flex-1 h-1.5 accent-vc-accent cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed';

    const time = this.tagRef(document.createElement('span'), 'time');
    time.className = 'shrink-0 min-w-[7.5rem] text-vc-muted text-sm tabular-nums text-right';

    bar.append(toggleBtn, seek, time);
    return bar;
  }

  protected bind(): void {
    const toggleBtn = this.ref<HTMLButtonElement>('toggle');
    const seek = this.ref<HTMLInputElement>('seek');

    toggleBtn.addEventListener('click', () => {
      this.togglePlayback();
    });

    seek.addEventListener('pointerdown', () => {
      this.isScrubbing = true;
    });

    seek.addEventListener('pointerup', () => {
      this.isScrubbing = false;
    });

    seek.addEventListener('pointercancel', () => {
      this.isScrubbing = false;
    });

    seek.addEventListener('input', () => {
      this.seekTo(Number(seek.value));
    });

    this.track(this.api.on('state:changed', () => this.syncDuration()));
    this.track(this.api.on('element:added', () => this.syncDuration()));
    this.track(this.api.on('element:removed', () => this.syncDuration()));
    this.track(this.api.on('element:updated', () => this.syncDuration()));

    this.render();
  }

  destroy(): void {
    this.stopPlaybackLoop();
    super.destroy();
  }

  private togglePlayback(): void {
    if (this.isPlaying) {
      this.pause();
      return;
    }
    this.play();
  }

  private play(): void {
    const duration = this.api.getDuration();
    if (duration === 0) {
      return;
    }

    if (this.currentTime >= duration) {
      this.currentTime = 0;
    }

    this.isPlaying = true;
    this.playbackStartedAt = this.currentTime;
    this.api.selectElement(null);
    this.api.render(this.currentTime, {
      playing: true,
      playbackStartedAt: this.playbackStartedAt,
    });
    this.updateUi();
    this.startPlaybackLoop();
  }

  private pause(): void {
    this.isPlaying = false;
    this.stopPlaybackLoop();
    this.api.render(this.currentTime, { playing: false });
    this.updateUi();
  }

  private seekTo(time: number): void {
    const duration = this.api.getDuration();
    this.currentTime = Math.max(0, Math.min(time, duration));
    this.api.render(this.currentTime, { playing: this.isPlaying });
    this.updateUi();
  }

  private startPlaybackLoop(): void {
    if (this.rafId !== null) {
      return;
    }

    this.lastFrameTimestamp = null;

    const tick = (timestamp: number) => {
      if (!this.isPlaying) {
        this.rafId = null;
        return;
      }

      if (this.lastFrameTimestamp !== null) {
        const deltaSeconds = (timestamp - this.lastFrameTimestamp) / 1000;
        const duration = this.api.getDuration();
        const nextTime = this.currentTime + deltaSeconds;

        if (nextTime >= duration) {
          this.currentTime = duration;
          this.pause();
          return;
        }

        this.currentTime = nextTime;
        this.api.render(this.currentTime, {
          playing: true,
          playbackStartedAt: this.playbackStartedAt,
        });
        this.updateUi();
      }

      this.lastFrameTimestamp = timestamp;
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopPlaybackLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTimestamp = null;
  }

  private syncDuration(): void {
    const duration = this.api.getDuration();

    if (this.currentTime > duration) {
      this.currentTime = duration;
      this.api.render(this.currentTime, {
        playing: this.isPlaying,
        playbackStartedAt: this.playbackStartedAt,
      });
    }

    this.updateUi();
  }

  private updateUi(): void {
    const duration = this.api.getDuration();
    const toggleBtn = this.ref<HTMLButtonElement>('toggle');
    const seek = this.ref<HTMLInputElement>('seek');
    const time = this.ref<HTMLSpanElement>('time');
    const hasDuration = duration > 0;

    toggleBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
    toggleBtn.disabled = !hasDuration;

    seek.max = String(duration);
    seek.disabled = !hasDuration;

    if (!this.isScrubbing) {
      seek.value = String(this.currentTime);
    }

    time.textContent = `${formatTime(this.currentTime)} / ${formatTime(duration)}`;
  }

  private render(): void {
    this.updateUi();
  }
}
