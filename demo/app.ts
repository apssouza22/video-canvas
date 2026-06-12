import { mountCompositionCanvasDemo } from './compositionCanvasDemo';

export function mountApp(container: HTMLElement): () => void {
  return mountCompositionCanvasDemo(container);
}
