import type { AspectRatioId } from './types';
import { getPlayerSizeFromAspectRatio } from '../viewport/player';

export const DEFAULT_ASPECT_RATIO: AspectRatioId = '16:9';

export const DEFAULT_PLAYER_SIZE = getPlayerSizeFromAspectRatio(DEFAULT_ASPECT_RATIO);
