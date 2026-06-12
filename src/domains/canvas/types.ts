export type CanvasElementType = 'video' | 'image' | 'text';

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
}

export interface VideoCanvasElement extends CanvasElementBase {
  type: 'video';
  src: string;
  muted: boolean;
  loop: boolean;
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

export type CanvasElement = VideoCanvasElement | ImageCanvasElement | TextCanvasElement;

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

export type CanvasAction =
  | { type: 'ADD_ELEMENT'; element: CanvasElement }
  | { type: 'UPDATE_ELEMENT'; id: string; patch: Partial<CanvasElement> }
  | { type: 'DELETE_ELEMENT'; id: string }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'BRING_FORWARD'; id: string }
  | { type: 'SEND_BACKWARD'; id: string }
  | { type: 'SET_ELEMENTS'; elements: CanvasElement[] }
  | { type: 'SET_ASPECT_RATIO'; aspectRatio: AspectRatioId };
