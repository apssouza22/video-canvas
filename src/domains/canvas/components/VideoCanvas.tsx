import { CanvasProvider } from '../CanvasContext';
import type { CanvasState } from '../types';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasViewport } from './CanvasViewport';
import { ElementProperties } from './ElementProperties';
import './VideoCanvas.css';

export interface VideoCanvasProps {
  initialState?: Partial<CanvasState>;
  className?: string;
}

export function VideoCanvas({ initialState, className }: VideoCanvasProps) {
  return (
    <CanvasProvider initialState={initialState}>
      <div className={['video-canvas', className].filter(Boolean).join(' ')}>
        <aside className="video-canvas__sidebar">
          <header className="video-canvas__header">
            <h1>Canvas</h1>
            <p>Manipulate video, image, and text layers on the composition surface.</p>
          </header>
          <CanvasToolbar />
          <ElementProperties />
        </aside>
        <main className="video-canvas__main">
          <CanvasViewport />
        </main>
      </div>
    </CanvasProvider>
  );
}
