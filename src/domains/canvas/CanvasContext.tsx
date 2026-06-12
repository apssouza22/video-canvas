import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { canvasReducer, initialCanvasState } from './canvasReducer';
import type { CanvasAction, CanvasElement, CanvasState } from './types';

interface CanvasContextValue {
  state: CanvasState;
  dispatch: (action: CanvasAction) => void;
  selectedElement: CanvasElement | null;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

interface CanvasProviderProps {
  children: ReactNode;
  initialState?: Partial<CanvasState>;
}

export function CanvasProvider({ children, initialState }: CanvasProviderProps) {
  const [state, dispatch] = useReducer(canvasReducer, {
    ...initialCanvasState,
    ...initialState,
    elements: initialState?.elements ?? initialCanvasState.elements,
  });

  const selectedElement = useMemo(
    () => state.elements.find((element) => element.id === state.selectedId) ?? null,
    [state.elements, state.selectedId],
  );

  const addElement = useCallback((element: CanvasElement) => {
    dispatch({ type: 'ADD_ELEMENT', element });
  }, []);

  const updateElement = useCallback((id: string, patch: Partial<CanvasElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, patch });
  }, []);

  const deleteElement = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ELEMENT', id });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', id });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      selectedElement,
      addElement,
      updateElement,
      deleteElement,
      selectElement,
    }),
    [state, selectedElement, addElement, updateElement, deleteElement, selectElement],
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}
