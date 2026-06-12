import type { Disposable } from '../core/Disposable';
import type { CanvasState } from '../types';
import { CanvasToolbar } from './CanvasToolbar';
import { CompositionCanvas } from './CompositionCanvas';
import { ElementPropertiesPanel } from './ElementProperties';
import { PlayerSettingsPanel } from './PlayerSettings';

export interface VideoCanvasOptions {
  initialState?: Partial<CanvasState>;
  className?: string;
}

/**
 * @deprecated Use `CompositionCanvas` for the canvas surface and compose your own UI around its API.
 */
export class VideoCanvas implements Disposable {
  private readonly container: HTMLElement;
  private readonly root: HTMLDivElement;
  private readonly canvas: CompositionCanvas;
  private readonly children: Disposable[] = [];

  constructor(container: HTMLElement, options: VideoCanvasOptions = {}) {
    this.container = container;

    this.root = document.createElement('div');
    this.root.className = [
      'grid grid-cols-[320px_1fr] grid-rows-[minmax(0,1fr)] h-screen overflow-hidden bg-vc-bg text-vc-text font-sans max-[960px]:grid-cols-1',
      options.className,
    ]
      .filter(Boolean)
      .join(' ');

    const sidebar = document.createElement('aside');
    sidebar.className =
      'flex flex-col gap-4 min-h-0 p-5 border-r border-vc-border bg-vc-panel overflow-y-auto overscroll-contain max-[960px]:border-r-0 max-[960px]:border-b max-[960px]:border-vc-border';

    const header = document.createElement('header');
    header.innerHTML = `
      <h1 class="m-0 text-xl">Canvas</h1>
      <p class="mt-1.5 mb-0 text-vc-muted text-sm leading-snug">Manipulate video, image, and text layers on the composition surface.</p>
    `;

    const main = document.createElement('main');
    main.className = 'relative min-w-0 min-h-0 overflow-hidden [contain:layout_size]';

    sidebar.append(header);
    this.root.append(sidebar, main);
    this.container.append(this.root);

    this.canvas = new CompositionCanvas(main, options);

    this.children.push(
      new PlayerSettingsPanel(sidebar, this.canvas),
      new CanvasToolbar(sidebar, this.canvas),
      new ElementPropertiesPanel(sidebar, this.canvas),
    );
  }

  destroy(): void {
    for (const child of this.children) {
      child.destroy();
    }
    this.children.length = 0;
    this.canvas.destroy();
    this.root.remove();
  }
}

/** @deprecated Use the `VideoCanvas` class or `CompositionCanvas` instead. */
export function mountVideoCanvas(
  container: HTMLElement,
  options: VideoCanvasOptions = {},
): () => void {
  const app = new VideoCanvas(container, options);
  return () => app.destroy();
}
