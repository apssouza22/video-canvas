import type { RenderOptions } from '../compositionCanvasApi';
import type { CanvasElement } from '../types';
import {
  bindElementSelection,
  type CanvasElementNodeRefs,
  type CreateElementOptions,
  type ElementContent,
} from './shared';

export abstract class BaseCanvasElementHandler<T extends CanvasElement> {
  abstract readonly type: T['type'];

  abstract createDefault(options: CreateElementOptions): T;
  abstract createContent(element: T): ElementContent;
  abstract updateContent(
    refs: Pick<CanvasElementNodeRefs, 'media' | 'text'>,
    element: T,
  ): void;

  get isSelectable(): boolean {
    return true;
  }

  get supportsVideoFrameSync(): boolean {
    return false;
  }

  configureNode(node: HTMLDivElement, element: T, onSelect: (id: string) => void): void {
    bindElementSelection(node, element.id, onSelect);
  }

  syncPlayback(
    refs: CanvasElementNodeRefs,
    element: T,
    compositionTime: number,
    options: RenderOptions = {},
  ): void {
    void refs;
    void element;
    void compositionTime;
    void options;
  }
}
