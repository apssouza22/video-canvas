import { mountCompositionPreviewDemo } from './compositionPreviewDemo';

export function mountApp(container: HTMLElement): () => void {
  return mountCompositionPreviewDemo(container);
}
