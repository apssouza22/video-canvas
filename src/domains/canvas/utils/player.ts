import type { AspectRatioId, CanvasSize } from '../types';

export const VIEWPORT_PADDING = 48;

export interface AspectRatioPreset {
  id: AspectRatioId;
  label: string;
  width: number;
  height: number;
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { id: '16:9', label: 'Landscape 16:9', width: 1280, height: 720 },
  { id: '9:16', label: 'Portrait 9:16', width: 720, height: 1280 },
  { id: '1:1', label: 'Square 1:1', width: 1080, height: 1080 },
  { id: '4:5', label: 'Portrait 4:5', width: 1080, height: 1350 },
  { id: '4:3', label: 'Classic 4:3', width: 1280, height: 960 },
];

export interface FittedPlayerLayout {
  scale: number;
  displayWidth: number;
  displayHeight: number;
}

export function getAspectRatioPreset(id: AspectRatioId): AspectRatioPreset {
  return ASPECT_RATIO_PRESETS.find((preset) => preset.id === id) ?? ASPECT_RATIO_PRESETS[0];
}

export function getPlayerSizeFromAspectRatio(id: AspectRatioId): CanvasSize {
  const preset = getAspectRatioPreset(id);
  return { width: preset.width, height: preset.height };
}

export function getFittedPlayerLayout(
  mainSize: CanvasSize,
  playerSize: CanvasSize,
  chromeHeight = 0,
  padding = VIEWPORT_PADDING,
): FittedPlayerLayout {
  const availableWidth = Math.max(mainSize.width - padding * 2, 1);
  const availableHeight = Math.max(mainSize.height - padding * 2 - chromeHeight, 1);

  const scale = Math.min(
    availableWidth / playerSize.width,
    availableHeight / playerSize.height,
  );

  return {
    scale,
    displayWidth: playerSize.width * scale,
    displayHeight: playerSize.height * scale,
  };
}
