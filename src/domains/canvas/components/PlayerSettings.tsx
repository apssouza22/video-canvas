import { useCanvas } from '../CanvasContext';
import type { AspectRatioId } from '../types';
import { ASPECT_RATIO_PRESETS } from '../utils/player';

export function PlayerSettings() {
  const { state, setAspectRatio } = useCanvas();

  return (
    <section className="player-settings">
      <div className="player-settings__header">
        <h2>Player / Export</h2>
        <p>The framed area is what will be included in the final render.</p>
      </div>

      <div className="player-settings__meta">
        <span>{state.playerSize.width} × {state.playerSize.height}</span>
        <span>{state.aspectRatio}</span>
      </div>

      <div className="player-settings__presets">
        {ASPECT_RATIO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={
              state.aspectRatio === preset.id ? 'player-settings__preset is-active' : 'player-settings__preset'
            }
            onClick={() => setAspectRatio(preset.id as AspectRatioId)}
          >
            <span className="player-settings__preset-ratio">{preset.id}</span>
            <span className="player-settings__preset-label">{preset.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
