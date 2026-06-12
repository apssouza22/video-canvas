export { mountCompositionCanvas } from './components/CompositionCanvas';
export type { CompositionCanvasHandle, CompositionCanvasOptions } from './components/CompositionCanvas';
export { mountVideoCanvas } from './components/VideoCanvas';
export type { VideoCanvasOptions } from './components/VideoCanvas';
export { CanvasStore } from './canvasStore';
export { canvasReducer, initialCanvasState } from './canvasReducer';
export { createCanvasElement } from './elementFactory';
export type {
  AddMediaOptions,
  CompositionCanvasAPI,
  CanvasEventHandler,
  CanvasEventMap,
  CanvasEventType,
} from './compositionCanvasApi';
export { createCompositionCanvasAPI } from './compositionCanvasApi';
export { CanvasEventEmitter } from './events';
export {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_PLAYER_SIZE,
  SAMPLE_IMAGE_SRC,
  SAMPLE_VIDEO_SRC,
} from './constants';
export {
  ASPECT_RATIO_PRESETS,
  getFittedPlayerLayout,
  getPlayerScale,
  getPlayerSizeFromAspectRatio,
  VIEWPORT_PADDING,
} from './utils/player';
export type {
  AspectRatioId,
  CanvasAction,
  CanvasElement,
  CanvasElementType,
  CanvasSize,
  CanvasState,
  ElementTransform,
  ImageCanvasElement,
  TextCanvasElement,
  VideoCanvasElement,
} from './types';
