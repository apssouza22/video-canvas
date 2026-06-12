import { useRef } from 'react';
import { CanvasProvider } from '../CanvasContext';
import type { CanvasState } from '../types';
import { CanvasToolbar } from './CanvasToolbar';
import { CanvasViewport } from './CanvasViewport';
import { ElementProperties } from './ElementProperties';
import { PlayerSettings } from './PlayerSettings';
import './VideoCanvas.css';

export interface VideoCanvasProps {
  initialState?: Partial<CanvasState>;
  className?: string;
}

export function VideoCanvas({ initialState, className }: VideoCanvasProps) {
  const mainRef = useRef<HTMLElement>(null);

  return (
    <CanvasProvider initialState={initialState}>
      <div className={['video-canvas', className].filter(Boolean).join(' ')}>
        <aside className="video-canvas__sidebar">
          <header className="video-canvas__header">
            <h1>Canvas</h1>
            <p>Manipulate video, image, and text layers on the composition surface.</p>
          </header>
          <PlayerSettings />
          <CanvasToolbar />
          <ElementProperties />
        </aside>
        <main ref={mainRef} className="video-canvas__main">
          <CanvasViewport mainRef={mainRef} />
        </main>
      </div>
    </CanvasProvider>
  );
}
