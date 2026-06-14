export type CanvasElementType = 'video' | 'image' | 'text' | 'audio';

export interface ElementTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface CanvasElementBase extends ElementTransform {
  id: string;
  type: CanvasElementType;
  zIndex: number;
  name: string;
  /** When the element becomes visible, in seconds. */
  startTime: number;
  /** How long the element stays visible, in seconds. */
  duration: number;
  /** Layer opacity from 0 (transparent) to 1 (opaque). */
  opacity: number;
}

export interface VideoCanvasElement extends CanvasElementBase {
  type: 'video';
  src: string;
  muted: boolean;
  loop: boolean;
  /** Trim offset into the source file, in seconds. */
  sourceOffset?: number;
}

export interface ImageCanvasElement extends CanvasElementBase {
  type: 'image';
  src: string;
  objectFit: 'cover' | 'contain' | 'fill';
}

export interface TextCanvasElement extends CanvasElementBase {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor: string;
}

export interface AudioCanvasElement extends CanvasElementBase {
  type: 'audio';
  src: string;
  loop: boolean;
  volume: number;
  /** Trim offset into the source file, in seconds. */
  sourceOffset?: number;
}

export type CanvasElement =
  | VideoCanvasElement
  | ImageCanvasElement
  | TextCanvasElement
  | AudioCanvasElement;

export interface CanvasSize {
  width: number;
  height: number;
}

export type AspectRatioId = '16:9' | '9:16' | '1:1' | '4:5' | '4:3';

export interface CanvasState {
  elements: CanvasElement[];
  selectedId: string | null;
  /** Final render/export dimensions (the player frame). */
  playerSize: CanvasSize;
  aspectRatio: AspectRatioId;
}
