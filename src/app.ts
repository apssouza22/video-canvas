import { mountCompositionCanvasDemo } from './demo/compositionCanvasDemo';

export function mountApp(container: HTMLElement): () => void {
  return mountCompositionCanvasDemo(container);
}
