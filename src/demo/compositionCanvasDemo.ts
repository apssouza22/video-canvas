import { CanvasToolbar } from '../domains/canvas/components/CanvasToolbar';
import { CompositionCanvas } from '../domains/canvas/components/CompositionCanvas';
import { ElementPropertiesPanel } from '../domains/canvas/components/ElementProperties';
import { PlayerSettingsPanel } from '../domains/canvas/components/PlayerSettings';
import type { Disposable } from '../domains/canvas/core/Disposable';
import { createCanvasElement } from '../domains/canvas/elementFactory';
import type { CanvasElement } from '../domains/canvas/types';
import { CanvasEventLogPanel } from './CanvasEventLogPanel';

function createDemoElements(): CanvasElement[] {
  const elements = [
    createCanvasElement({ type: 'video', zIndex: 0 }),
    createCanvasElement({ type: 'text', zIndex: 1 }),
  ];

  elements[0].x = 180;
  elements[0].y = 120;
  elements[0].width = 520;
  elements[0].height = 300;

  elements[1].x = 760;
  elements[1].y = 480;
  elements[1].width = 420;
  elements[1].height = 100;
  if (elements[1].type === 'text') {
    elements[1].content = 'Drag, resize, and rotate me';
  }

  return elements;
}

export class CompositionCanvasDemo implements Disposable {
  private readonly container: HTMLElement;
  private readonly root: HTMLDivElement;
  private readonly canvas: CompositionCanvas;
  private readonly children: Disposable[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    const demoElements = createDemoElements();

    this.root = document.createElement('div');
    this.root.className =
      'grid grid-cols-[320px_1fr] grid-rows-[minmax(0,1fr)] h-screen overflow-hidden bg-vc-bg text-vc-text font-sans max-[960px]:grid-cols-1';

    const sidebar = document.createElement('aside');
    sidebar.className =
      'flex flex-col gap-4 min-h-0 p-5 border-r border-vc-border bg-vc-panel overflow-y-auto overscroll-contain max-[960px]:border-r-0 max-[960px]:border-b max-[960px]:border-vc-border';

    const header = document.createElement('header');
    header.innerHTML = `
      <h1 class="m-0 text-xl">CompositionCanvas Demo</h1>
      <p class="mt-1.5 mb-0 text-vc-muted text-sm leading-snug">Sidebar controls consume the canvas through its public API and event subscriptions.</p>
    `;

    const main = document.createElement('main');
    main.className = 'relative min-w-0 min-h-0 overflow-hidden [contain:layout_size]';

    sidebar.append(header);
    this.root.append(sidebar, main);
    this.container.append(this.root);

    this.canvas = new CompositionCanvas(main, {
      initialState: { elements: demoElements, selectedId: demoElements[1].id },
    });

    this.children.push(
      new PlayerSettingsPanel(sidebar, this.canvas),
      new CanvasToolbar(sidebar, this.canvas),
      new ElementPropertiesPanel(sidebar, this.canvas),
      new CanvasEventLogPanel(sidebar, this.canvas),
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

export function mountCompositionCanvasDemo(container: HTMLElement): () => void {
  const demo = new CompositionCanvasDemo(container);
  return () => demo.destroy();
}
