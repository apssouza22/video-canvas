export { CompositionCanvas, mountCompositionCanvas } from './CompositionCanvas';
export type { CompositionCanvasOptions } from './CompositionCanvas';
export { CanvasStore, initialCanvasState } from './canvasStore';
export { createCanvasElement } from './elementFactory';
export {
  applyElementStyles,
  BASE_ELEMENT_CLASS,
  bindElementSelection,
  createElementBase,
  syncMediaPlayback,
} from './elementShared';
export type {
  CanvasElementNodeRefs,
  CreateElementOptions,
  ElementContent,
} from './elementShared';
export { BaseCanvasElementHandler } from './BaseCanvasElementHandler';
export { AudioElementHandler } from '../audio';
export { ImageElementHandler } from '../image';
export { TextElementHandler } from '../text';
export { VideoElementHandler } from '../video';
export { getElementHandler, getElementHandlerByType } from './registry';
export {
  createCanvasElementNode,
  syncElementPlayback,
  updateCanvasElementNode,
} from './CanvasElement';
export type {
  CompositionCanvasAPI,
  RenderOptions,
} from './compositionCanvasApi';
export type { CanvasEventHandler, CanvasEventMap, CanvasEventType } from '../event/events';
export { CanvasEventEmitter } from '../event/events';
export type { Disposable } from './Disposable';
export {
  DEFAULT_ASPECT_RATIO,
  DEFAULT_PLAYER_SIZE,
} from './constants';
export { SAMPLE_IMAGE_SRC } from '../image/constants';
export { SAMPLE_VIDEO_SRC } from '../video/constants';
export { CanvasViewport } from '../viewport/CanvasViewport';
export {
  ASPECT_RATIO_PRESETS,
  getFittedPlayerLayout,
  getPlayerSizeFromAspectRatio,
  VIEWPORT_PADDING,
} from '../viewport/player';
export {
  DEFAULT_ELEMENT_DURATION,
  getCompositionDuration,
  getElementEndTime,
  getElementLocalTime,
  getVideoMediaTime,
  getVisibleElements,
  isElementVisibleAtTime,
} from './timing';
export { VisibilityTimeline } from './visibilityTimeline';
export type { VisibilitySegment } from './visibilityTimeline';
export type {
  AspectRatioId,
  AudioCanvasElement,
  CanvasElement,
  CanvasElementType,
  CanvasSize,
  CanvasState,
  ElementTransform,
  ImageCanvasElement,
  TextCanvasElement,
  VideoCanvasElement,
} from './types';
