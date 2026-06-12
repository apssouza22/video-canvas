import type { CompositionCanvasAPI } from '../src/domains/canvas/compositionCanvasApi';
import type { AspectRatioId } from '../src/domains/canvas/types';
import { ASPECT_RATIO_PRESETS } from '../src/domains/canvas/utils/player';
import { UIComponent } from './core/UIComponent';

const panelClass =
  'flex flex-col gap-3 p-3.5 border border-vc-border rounded-xl bg-white/[0.02]';
const presetBaseClass =
  'grid grid-cols-[3.5rem_1fr] gap-2.5 items-center border border-vc-border rounded-[10px] px-2.5 py-2 bg-[#11151d] text-vc-text text-left cursor-pointer hover:border-vc-accent';
const presetActiveClass =
  'border-vc-accent bg-[#1a2740] shadow-[inset_0_0_0_1px_rgba(62,138,245,0.35)]';

export class PlayerSettingsPanel extends UIComponent {
  constructor(container: HTMLElement, api: CompositionCanvasAPI) {
    super(container, api);
    this.bind();
  }

  protected createElement(): HTMLElement {
    const section = document.createElement('section');
    section.className = panelClass;

    const header = document.createElement('div');
    header.innerHTML = `
      <h2 class="m-0 text-base">Player / Export</h2>
      <p class="mt-1.5 mb-0 text-vc-muted text-[0.8rem] leading-snug">The framed area is what will be included in the final render.</p>
    `;

    const meta = this.tagRef(document.createElement('div'), 'meta');
    meta.className =
      'flex justify-between gap-2 text-vc-accent text-xs font-semibold tracking-wide uppercase';

    const presets = this.tagRef(document.createElement('div'), 'presets');
    presets.className = 'grid gap-2';

    section.append(header, meta, presets);
    return section;
  }

  protected bind(): void {
    this.track(this.api.on('state:changed', () => this.render()));
    this.render();
  }

  private render(): void {
    const { playerSize, aspectRatio } = this.api.getState();
    const meta = this.ref<HTMLDivElement>('meta');
    const presets = this.ref<HTMLDivElement>('presets');

    meta.innerHTML = `
      <span>${playerSize.width} × ${playerSize.height}</span>
      <span>${aspectRatio}</span>
    `;

    presets.replaceChildren(
      ...ASPECT_RATIO_PRESETS.map((preset) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className =
          preset.id === aspectRatio
            ? `${presetBaseClass} ${presetActiveClass}`
            : presetBaseClass;
        button.innerHTML = `
          <span class="text-[0.8rem] font-bold">${preset.id}</span>
          <span class="text-vc-muted text-xs">${preset.label}</span>
        `;
        button.addEventListener('click', () => {
          this.api.setAspectRatio(preset.id as AspectRatioId);
        });
        return button;
      }),
    );
  }
}
