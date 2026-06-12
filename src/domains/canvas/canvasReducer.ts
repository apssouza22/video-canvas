import type { CanvasAction, CanvasElement, CanvasState } from './types';
import { DEFAULT_CANVAS_SIZE } from './constants';

export const initialCanvasState: CanvasState = {
  elements: [],
  selectedId: null,
  canvasSize: DEFAULT_CANVAS_SIZE,
};

function normalizeZIndex(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((element, index) => ({ ...element, zIndex: index }));
}

function sortByZIndex(elements: CanvasElement[]): CanvasElement[] {
  return elements.slice().sort((a, b) => a.zIndex - b.zIndex);
}

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const elements = normalizeZIndex(sortByZIndex([...state.elements, action.element]));
      return {
        ...state,
        elements,
        selectedId: action.element.id,
      };
    }

    case 'UPDATE_ELEMENT': {
      const elements = state.elements.map((element) =>
        element.id === action.id ? ({ ...element, ...action.patch } as CanvasElement) : element,
      );
      return { ...state, elements };
    }

    case 'DELETE_ELEMENT': {
      const elements = normalizeZIndex(
        state.elements.filter((element) => element.id !== action.id),
      );
      return {
        ...state,
        elements,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    }

    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id };

    case 'BRING_FORWARD': {
      const index = state.elements.findIndex((element) => element.id === action.id);
      if (index === -1 || index === state.elements.length - 1) {
        return state;
      }

      const elements = state.elements.slice();
      const [item] = elements.splice(index, 1);
      elements.splice(index + 1, 0, item);

      return { ...state, elements: normalizeZIndex(elements) };
    }

    case 'SEND_BACKWARD': {
      const index = state.elements.findIndex((element) => element.id === action.id);
      if (index <= 0) {
        return state;
      }

      const elements = state.elements.slice();
      const [item] = elements.splice(index, 1);
      elements.splice(index - 1, 0, item);

      return { ...state, elements: normalizeZIndex(elements) };
    }

    case 'SET_ELEMENTS':
      return { ...state, elements: normalizeZIndex(sortByZIndex(action.elements)) };

    default:
      return state;
  }
}
