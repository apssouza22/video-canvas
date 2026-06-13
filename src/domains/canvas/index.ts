export { CompositionCanvas, mountCompositionCanvas } from './components/CompositionCanvas';
export type { CompositionCanvasOptions } from './components/CompositionCanvas';
export { CanvasViewport } from './components/CanvasViewport';
export { CanvasStore, initialCanvasState } from './canvasStore';
export { createCanvasElement } from './elementFactory';
export type {
  AddMediaOptions,
  CompositionCanvasAPI,
  CanvasEventHandler,
  CanvasEventMap,
  CanvasEventType,
  RenderOptions,
} from './compositionCanvasApi';
export { CanvasEventEmitter } from './events';
export type { Disposable } from './core/Disposable';
export {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_PLAYER_SIZE,
  SAMPLE_IMAGE_SRC,
  SAMPLE_VIDEO_SRC,
} from './constants';
export {
  ASPECT_RATIO_PRESETS,
  getFittedPlayerLayout,
  getPlayerSizeFromAspectRatio,
  VIEWPORT_PADDING,
} from './utils/player';
export {
  DEFAULT_ELEMENT_DURATION,
  getCompositionDuration,
  getElementEndTime,
  getElementLocalTime,
  getVideoMediaTime,
  getVisibleElements,
  isElementVisibleAtTime,
} from './utils/timing';
export type {
  AspectRatioId,
  CanvasElement,
  CanvasElementType,
  CanvasSize,
  CanvasState,
  ElementTransform,
  ImageCanvasElement,
  TextCanvasElement,
  VideoCanvasElement,
} from './types';
