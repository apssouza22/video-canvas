import { mountCanvasToolbar } from '../domains/canvas/components/CanvasToolbar';
import { mountCompositionCanvas } from '../domains/canvas/components/CompositionCanvas';
import { mountElementProperties } from '../domains/canvas/components/ElementProperties';
import { mountPlayerSettings } from '../domains/canvas/components/PlayerSettings';
import { createCanvasElement } from '../domains/canvas/elementFactory';
import type { CompositionCanvasAPI } from '../domains/canvas/compositionCanvasApi';

function mountEventLog(container: HTMLElement, api: CompositionCanvasAPI): () => void {
  const panel = document.createElement('section');
  panel.className =
    'flex flex-col gap-2 p-3.5 border border-vc-border rounded-xl bg-white/[0.02]';

  const header = document.createElement('div');
  header.innerHTML = `
    <h2 class="m-0 text-base">Event log</h2>
    <p class="mt-1.5 mb-0 text-vc-muted text-[0.8rem] leading-snug">Live stream from <code class="text-vc-accent">CompositionCanvas</code> events.</p>
  `;

  const list = document.createElement('ul');
  list.className =
    'm-0 p-0 list-none flex flex-col gap-1.5 max-h-40 overflow-y-auto text-xs font-mono';

  panel.append(header, list);
  container.append(panel);

  const entries: string[] = [];
  const maxEntries = 8;

  const pushEntry = (message: string) => {
    entries.unshift(message);
    if (entries.length > maxEntries) {
      entries.length = maxEntries;
    }
    list.replaceChildren(
      ...entries.map((entry) => {
        const item = document.createElement('li');
        item.className = 'text-vc-muted';
        item.textContent = entry;
        return item;
      }),
    );
  };

  const unsubscribers = [
    api.on('element:added', ({ element }) => {
      pushEntry(`element:added → ${element.type} (${element.id.slice(0, 8)}…)`);
    }),
    api.on('element:removed', ({ id }) => {
      pushEntry(`element:removed → ${id.slice(0, 8)}…`);
    }),
    api.on('element:updated', ({ id, patch }) => {
      const keys = Object.keys(patch).join(', ');
      pushEntry(`element:updated → ${id.slice(0, 8)}… [${keys}]`);
    }),
    api.on('selection:changed', ({ selectedId }) => {
      pushEntry(`selection:changed → ${selectedId ?? 'none'}`);
    }),
    api.on('aspect-ratio:changed', ({ aspectRatio, playerSize }) => {
      pushEntry(`aspect-ratio:changed → ${aspectRatio} (${playerSize.width}×${playerSize.height})`);
    }),
  ];

  pushEntry('Listening for canvas events…');

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
    panel.remove();
  };
}

export function mountCompositionCanvasDemo(container: HTMLElement): () => void {
  const demoElements = [
    createCanvasElement({ type: 'video', zIndex: 0 }),
    createCanvasElement({ type: 'text', zIndex: 1 }),
  ];

  demoElements[0].x = 180;
  demoElements[0].y = 120;
  demoElements[0].width = 520;
  demoElements[0].height = 300;

  demoElements[1].x = 760;
  demoElements[1].y = 480;
  demoElements[1].width = 420;
  demoElements[1].height = 100;
  if (demoElements[1].type === 'text') {
    demoElements[1].content = 'Drag, resize, and rotate me';
  }

  const root = document.createElement('div');
  root.className =
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
  root.append(sidebar, main);
  container.append(root);

  const canvas = mountCompositionCanvas(main, {
    initialState: { elements: demoElements, selectedId: demoElements[1].id },
  });

  const { api } = canvas;

  const cleanups = [
    mountPlayerSettings(sidebar, api),
    mountCanvasToolbar(sidebar, api),
    mountElementProperties(sidebar, api),
    mountEventLog(sidebar, api),
    () => canvas.destroy(),
  ];

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    root.remove();
  };
}
