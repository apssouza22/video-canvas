import { mountCanvasToolbar } from './CanvasToolbar';
import { mountCompositionCanvas } from './CompositionCanvas';
import { mountElementProperties } from './ElementProperties';
import { mountPlayerSettings } from './PlayerSettings';
import type { CanvasState } from '../types';

export interface VideoCanvasOptions {
  initialState?: Partial<CanvasState>;
  className?: string;
}

/**
 * @deprecated Use `mountCompositionCanvas` for the canvas surface and compose your own UI around its API.
 */
export function mountVideoCanvas(
  container: HTMLElement,
  options: VideoCanvasOptions = {},
): () => void {
  const root = document.createElement('div');
  root.className = [
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
  root.append(sidebar, main);
  container.append(root);

  const canvas = mountCompositionCanvas(main, options);

  const cleanups = [
    mountPlayerSettings(sidebar, canvas.api),
    mountCanvasToolbar(sidebar, canvas.api),
    mountElementProperties(sidebar, canvas.api),
    () => canvas.destroy(),
  ];

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    root.remove();
  };
}
