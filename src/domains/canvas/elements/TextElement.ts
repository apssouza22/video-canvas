import type { TextCanvasElement } from '../types';
import { BaseCanvasElementHandler } from './BaseCanvasElementHandler';
import { createElementBase, type CreateElementOptions } from './shared';
import type { CanvasElementNodeRefs } from './shared';

export class TextElementHandler extends BaseCanvasElementHandler<TextCanvasElement> {
  readonly type = 'text' as const;

  createDefault(options: CreateElementOptions): TextCanvasElement {
    return {
      ...createElementBase(options),
      type: 'text',
      name: 'Text',
      width: 420,
      height: 120,
      content: 'Double-click style editing in the panel →',
      fontSize: 42,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 700,
      color: '#ffffff',
      textAlign: 'center',
      backgroundColor: 'transparent',
    };
  }

  createContent(element: TextCanvasElement) {
    const text = document.createElement('div');
    text.className =
      'canvas-element__text flex items-center justify-center p-2 box-border whitespace-pre-wrap break-words w-full h-full pointer-events-none';
    text.textContent = element.content;
    text.style.fontSize = `${element.fontSize}px`;
    text.style.fontFamily = element.fontFamily;
    text.style.fontWeight = String(element.fontWeight);
    text.style.color = element.color;
    text.style.textAlign = element.textAlign;
    text.style.backgroundColor = element.backgroundColor;
    return { node: text, text };
  }

  updateContent(
    refs: Pick<CanvasElementNodeRefs, 'media' | 'text'>,
    element: TextCanvasElement,
  ): void {
    const { text } = refs;
    if (!text) {
      return;
    }

    if (text.textContent !== element.content) {
      text.textContent = element.content;
    }
    const fontSize = `${element.fontSize}px`;
    if (text.style.fontSize !== fontSize) {
      text.style.fontSize = fontSize;
    }
    if (text.style.fontFamily !== element.fontFamily) {
      text.style.fontFamily = element.fontFamily;
    }
    const fontWeight = String(element.fontWeight);
    if (text.style.fontWeight !== fontWeight) {
      text.style.fontWeight = fontWeight;
    }
    if (text.style.color !== element.color) {
      text.style.color = element.color;
    }
    if (text.style.textAlign !== element.textAlign) {
      text.style.textAlign = element.textAlign;
    }
    if (text.style.backgroundColor !== element.backgroundColor) {
      text.style.backgroundColor = element.backgroundColor;
    }
  }
}
