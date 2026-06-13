import type { CanvasElement, CanvasSize } from './types';

export interface ClipBuildContext {
  zIndex: number;
  playerSize: CanvasSize;
}

export interface CompositionClip {
  toElement(context: ClipBuildContext): CanvasElement;
}
