import { createCanvasElement } from './elementFactory';
import type {
  AudioCanvasElement,
  CanvasElement,
  CanvasSize,
  ImageCanvasElement,
  TextCanvasElement,
  VideoCanvasElement,
} from './types';
import { createElementId } from './utils/id';
import { DEFAULT_ELEMENT_DURATION } from './utils/timing';

export interface ClipBuildContext {
  zIndex: number;
  playerSize: CanvasSize;
}

export interface CompositionClip {
  toElement(context: ClipBuildContext): CanvasElement;
}

export class VideoClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;

  constructor(
    src: string,
    startTime: number,
    duration?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
  ) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  toElement({ zIndex, playerSize }: ClipBuildContext): VideoCanvasElement {
    const defaults = createCanvasElement({
      type: 'video',
      src: this.src,
      zIndex,
      playerSize,
    }) as VideoCanvasElement;

    return {
      ...defaults,
      startTime: this.startTime,
      duration: this.duration ?? defaults.duration,
      x: this.x ?? defaults.x,
      y: this.y ?? defaults.y,
      width: this.width ?? defaults.width,
      height: this.height ?? defaults.height,
    };
  }
}

export class AudioClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;

  constructor(src: string, startTime: number, duration?: number) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
  }

  toElement({ zIndex }: ClipBuildContext): AudioCanvasElement {
    return {
      id: createElementId(),
      type: 'audio',
      name: 'Audio',
      zIndex,
      src: this.src,
      startTime: this.startTime,
      duration: this.duration ?? DEFAULT_ELEMENT_DURATION,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: 1,
      loop: false,
      volume: 1,
    };
  }
}

export class TextClip implements CompositionClip {
  readonly text: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly opacity: number;

  constructor(
    text: string,
    startTime: number,
    duration?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    opacity = 1,
  ) {
    this.text = text;
    this.startTime = startTime;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
  }

  toElement({ zIndex, playerSize }: ClipBuildContext): TextCanvasElement {
    const defaults = createCanvasElement({
      type: 'text',
      zIndex,
      playerSize,
    }) as TextCanvasElement;

    return {
      ...defaults,
      content: this.text,
      startTime: this.startTime,
      duration: this.duration ?? defaults.duration,
      x: this.x ?? defaults.x,
      y: this.y ?? defaults.y,
      width: this.width ?? defaults.width,
      height: this.height ?? defaults.height,
      opacity: this.opacity,
    };
  }
}

export class ImageClip implements CompositionClip {
  readonly src: string;
  readonly startTime: number;
  readonly duration?: number;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  readonly opacity: number;

  constructor(
    src: string,
    startTime: number,
    duration?: number,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    opacity = 1,
  ) {
    this.src = src;
    this.startTime = startTime;
    this.duration = duration;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opacity = opacity;
  }

  toElement({ zIndex, playerSize }: ClipBuildContext): ImageCanvasElement {
    const defaults = createCanvasElement({
      type: 'image',
      src: this.src,
      zIndex,
      playerSize,
    }) as ImageCanvasElement;

    return {
      ...defaults,
      startTime: this.startTime,
      duration: this.duration ?? defaults.duration,
      x: this.x ?? defaults.x,
      y: this.y ?? defaults.y,
      width: this.width ?? defaults.width,
      height: this.height ?? defaults.height,
      opacity: this.opacity,
    };
  }
}
