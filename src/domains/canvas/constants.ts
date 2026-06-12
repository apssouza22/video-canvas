import type { AspectRatioId } from './types';
import { getPlayerSizeFromAspectRatio } from './utils/player';

export const DEFAULT_ASPECT_RATIO: AspectRatioId = '16:9';

export const DEFAULT_PLAYER_SIZE = getPlayerSizeFromAspectRatio(DEFAULT_ASPECT_RATIO);

export const SAMPLE_VIDEO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const SAMPLE_IMAGE_SRC =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop';
