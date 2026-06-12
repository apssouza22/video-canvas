export { VideoCanvas } from './components/VideoCanvas';
export type { VideoCanvasProps } from './components/VideoCanvas';
export { CanvasProvider, useCanvas } from './CanvasContext';
export { canvasReducer, initialCanvasState } from './canvasReducer';
export { createCanvasElement } from './elementFactory';
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
