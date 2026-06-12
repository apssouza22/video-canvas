import type { CanvasElement, ElementTransform } from '../types';
import { toCanvasPoint } from '../viewportLayout';
import {
  elementTransformStyle,
  resizeElement,
  rotateElement,
  type ResizeHandle,
} from '../utils/transform';

type InteractionMode =
  | { type: 'move'; start: ElementTransform; startPointer: { x: number; y: number } }
  | {
      type: 'resize';
      handle: ResizeHandle;
      start: ElementTransform;
      startPointer: { x: number; y: number };
    }
  | {
      type: 'rotate';
      start: ElementTransform;
      startPointer: { x: number; y: number };
    };

const RESIZE_HANDLES: ResizeHandle[] = [
  'top-left',
  'top',
  'top-right',
  'right',
  'bottom-right',
  'bottom',
  'bottom-left',
  'left',
];

const HANDLE_POSITIONS: Record<ResizeHandle, string> = {
  'top-left': 'top-[-6px] left-[-6px] cursor-nwse-resize',
  top: 'top-[-6px] left-[calc(50%-5px)] cursor-ns-resize',
  'top-right': 'top-[-6px] right-[-6px] cursor-nesw-resize',
  right: 'top-[calc(50%-5px)] right-[-6px] cursor-ew-resize',
  'bottom-right': 'right-[-6px] bottom-[-6px] cursor-nwse-resize',
  bottom: 'bottom-[-6px] left-[calc(50%-5px)] cursor-ns-resize',
  'bottom-left': 'bottom-[-6px] left-[-6px] cursor-nesw-resize',
  left: 'top-[calc(50%-5px)] left-[-6px] cursor-ew-resize',
};

const handleBaseClass =
  'absolute w-2.5 h-2.5 border-2 border-vc-selection rounded-full bg-vc-handle p-0 pointer-events-auto';

export interface TransformOverlayContext {
  getCompositionRect: () => DOMRect | null;
  getScale: () => number;
  onTransform: (patch: Partial<ElementTransform>) => void;
}

type OverlayNode = HTMLDivElement & {
  applyStyles: () => void;
  cleanup: () => void;
};

export function createTransformOverlay(
  getElement: () => CanvasElement,
  context: TransformOverlayContext,
): OverlayNode {
  let interaction: InteractionMode | null = null;

  const overlay = document.createElement('div') as OverlayNode;
  overlay.className = 'absolute pointer-events-none';

  const box = document.createElement('div');
  box.className =
    'absolute inset-0 border-2 border-vc-selection pointer-events-auto cursor-move';

  const rotateHandle = document.createElement('button');
  rotateHandle.type = 'button';
  rotateHandle.className = `${handleBaseClass} transform-overlay__rotate-handle top-[-34px] left-[calc(50%-5px)] cursor-grab`;
  rotateHandle.setAttribute('aria-label', 'Rotate element');

  overlay.append(box);

  for (const handle of RESIZE_HANDLES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${handleBaseClass} ${HANDLE_POSITIONS[handle]}`;
    button.setAttribute('aria-label', `Resize ${handle}`);
    button.addEventListener('pointerdown', (event) => {
      const element = getElement();
      beginInteraction(
        {
          type: 'resize',
          handle,
          start: element,
          startPointer: getPointer(event),
        },
        event,
      );
    });
    overlay.append(button);
  }

  overlay.append(rotateHandle);

  const applyStyles = () => {
    const element = getElement();
    const style = elementTransformStyle(element);
    Object.assign(overlay.style, {
      left: `${style.left}px`,
      top: `${style.top}px`,
      width: `${style.width}px`,
      height: `${style.height}px`,
      transform: style.transform,
      transformOrigin: style.transformOrigin,
      zIndex: String(element.zIndex + 1),
    });
  };

  const getPointer = (event: PointerEvent) => {
    const compositionRect = context.getCompositionRect();
    if (!compositionRect) {
      return { x: 0, y: 0 };
    }
    return toCanvasPoint(event.clientX, event.clientY, compositionRect, context.getScale());
  };

  const beginInteraction = (mode: InteractionMode, event: PointerEvent) => {
    event.stopPropagation();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    interaction = mode;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!interaction) {
      return;
    }

    const compositionRect = context.getCompositionRect();
    if (!compositionRect) {
      return;
    }

    const pointer = toCanvasPoint(
      event.clientX,
      event.clientY,
      compositionRect,
      context.getScale(),
    );

    if (interaction.type === 'move') {
      const dx = pointer.x - interaction.startPointer.x;
      const dy = pointer.y - interaction.startPointer.y;
      context.onTransform({
        x: interaction.start.x + dx,
        y: interaction.start.y + dy,
      });
      return;
    }

    if (interaction.type === 'resize') {
      context.onTransform(
        resizeElement(
          interaction.start,
          interaction.handle,
          pointer,
          interaction.startPointer,
        ),
      );
      return;
    }

    context.onTransform(rotateElement(interaction.start, pointer, interaction.startPointer));
  };

  const handlePointerUp = () => {
    interaction = null;
  };

  box.addEventListener('pointerdown', (event) => {
    const element = getElement();
    beginInteraction(
      {
        type: 'move',
        start: element,
        startPointer: getPointer(event),
      },
      event,
    );
  });

  rotateHandle.addEventListener('pointerdown', (event) => {
    const element = getElement();
    beginInteraction(
      {
        type: 'rotate',
        start: element,
        startPointer: getPointer(event),
      },
      event,
    );
  });

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  overlay.applyStyles = applyStyles;
  overlay.cleanup = () => {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  applyStyles();
  return overlay;
}

export function updateTransformOverlay(overlay: OverlayNode): void {
  overlay.applyStyles();
}

export function destroyTransformOverlay(overlay: OverlayNode): void {
  overlay.cleanup();
  overlay.remove();
}
