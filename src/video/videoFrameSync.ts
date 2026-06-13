const DRIFT_THRESHOLD_SECONDS = 0.1;

export function supportsVideoFrameCallback(
  video: HTMLVideoElement,
): video is HTMLVideoElement & {
  requestVideoFrameCallback: HTMLVideoElement['requestVideoFrameCallback'];
  cancelVideoFrameCallback: HTMLVideoElement['cancelVideoFrameCallback'];
} {
  return (
    typeof video.requestVideoFrameCallback === 'function' &&
    typeof video.cancelVideoFrameCallback === 'function'
  );
}

export function startVideoFrameSync(
  video: HTMLVideoElement,
  getExpectedTime: () => number,
  shouldContinue: () => boolean,
): () => void {
  if (!supportsVideoFrameCallback(video)) {
    return () => {};
  }

  let callbackId = 0;

  const onFrame = (_now: number, metadata: VideoFrameCallbackMetadata) => {
    if (!shouldContinue()) {
      return;
    }

    const expected = getExpectedTime();
    const drift = Math.abs(metadata.mediaTime - expected);
    if (drift > DRIFT_THRESHOLD_SECONDS) {
      try {
        video.currentTime = expected;
      } catch {
        // Ignore seek errors while metadata is loading.
      }
    }

    callbackId = video.requestVideoFrameCallback(onFrame);
  };

  callbackId = video.requestVideoFrameCallback(onFrame);

  return () => {
    video.cancelVideoFrameCallback(callbackId);
  };
}
