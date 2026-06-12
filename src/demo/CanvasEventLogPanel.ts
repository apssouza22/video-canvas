import { UIComponent } from '../domains/canvas/core/UIComponent';

export class CanvasEventLogPanel extends UIComponent {
  private entries: string[] = [];
  private readonly maxEntries = 8;

  constructor(container: HTMLElement, api: ConstructorParameters<typeof UIComponent>[1]) {
    super(container, api);
    this.bind();
  }

  protected createElement(): HTMLElement {
    const panel = document.createElement('section');
    panel.className =
      'flex flex-col gap-2 p-3.5 border border-vc-border rounded-xl bg-white/[0.02]';

    const header = document.createElement('div');
    header.innerHTML = `
      <h2 class="m-0 text-base">Event log</h2>
      <p class="mt-1.5 mb-0 text-vc-muted text-[0.8rem] leading-snug">Live stream from <code class="text-vc-accent">CompositionCanvas</code> events.</p>
    `;

    const list = this.tagRef(document.createElement('ul'), 'list');
    list.className =
      'm-0 p-0 list-none flex flex-col gap-1.5 max-h-40 overflow-y-auto text-xs font-mono';

    panel.append(header, list);
    return panel;
  }

  protected bind(): void {
    this.track(
      this.api.on('element:added', ({ element }) => {
        this.pushEntry(`element:added → ${element.type} (${element.id.slice(0, 8)}…)`);
      }),
    );
    this.track(
      this.api.on('element:removed', ({ id }) => {
        this.pushEntry(`element:removed → ${id.slice(0, 8)}…`);
      }),
    );
    this.track(
      this.api.on('element:updated', ({ id, patch }) => {
        const keys = Object.keys(patch).join(', ');
        this.pushEntry(`element:updated → ${id.slice(0, 8)}… [${keys}]`);
      }),
    );
    this.track(
      this.api.on('selection:changed', ({ selectedId }) => {
        this.pushEntry(`selection:changed → ${selectedId ?? 'none'}`);
      }),
    );
    this.track(
      this.api.on('aspect-ratio:changed', ({ aspectRatio, playerSize }) => {
        this.pushEntry(
          `aspect-ratio:changed → ${aspectRatio} (${playerSize.width}×${playerSize.height})`,
        );
      }),
    );

    this.pushEntry('Listening for canvas events…');
  }

  private pushEntry(message: string): void {
    this.entries.unshift(message);
    if (this.entries.length > this.maxEntries) {
      this.entries.length = this.maxEntries;
    }

    const list = this.ref<HTMLUListElement>('list');
    list.replaceChildren(
      ...this.entries.map((entry) => {
        const item = document.createElement('li');
        item.className = 'text-vc-muted';
        item.textContent = entry;
        return item;
      }),
    );
  }
}
