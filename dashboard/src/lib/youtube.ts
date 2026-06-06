/* ----------------------------------------------------------------------------
   YouTube helpers — extract a video ID from any common URL form and build
   the thumbnail URL used as a knowledge entry's cover image.
---------------------------------------------------------------------------- */

/**
 * Extract the 11-character video ID from common YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEOID
 * - https://youtu.be/VIDEOID
 * - https://www.youtube.com/embed/VIDEOID
 * - https://www.youtube.com/shorts/VIDEOID
 * - https://www.youtube.com/live/VIDEOID
 * Returns null if no valid ID is found.
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Bare 11-char ID pasted directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/, // watch?v=
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/
    /\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/
    /\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/
    /\/live\/([a-zA-Z0-9_-]{11})/, // /live/
  ];

  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Build the best-quality thumbnail URL for a video ID. */
export function youTubeThumbnail(
  id: string,
  quality: "default" | "mq" | "hq" | "sd" | "max" = "hq",
): string {
  const map = {
    default: "default", // 120x90
    mq: "mqdefault", // 320x180
    hq: "hqdefault", // 480x360
    sd: "sddefault", // 640x480
    max: "maxresdefault", // 1280x720
  } as const;
  return `https://img.youtube.com/vi/${id}/${map[quality]}.jpg`;
}

/** True when the string looks like a YouTube link. */
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}
