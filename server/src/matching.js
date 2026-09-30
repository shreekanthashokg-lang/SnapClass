/**
 * Face matching: face-api.js's FaceRecognitionNet produces 128-dimensional descriptors
 * where Euclidean distance between two descriptors of the SAME person is typically
 * well under 0.6, and distances between different people are typically well above it.
 * This threshold (0.6) is the value documented and commonly used by the face-api.js /
 * dlib face recognition models this library is derived from.
 */
export const FACE_MATCH_DISTANCE_THRESHOLD = 0.6;

export function euclideanDistance(a, b) {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Voice matching: cosine similarity between two averaged-MFCC voiceprints (see
 * server/src/voice.js). This is a lightweight acoustic-similarity method, not a deep
 * speaker-embedding model, so the threshold is intentionally conservative. The teacher
 * always sees the score and reviews the report before it is saved.
 */
export const VOICE_MATCH_SIMILARITY_THRESHOLD = 0.82;

export function cosineSimilarity(a, b) {
  if (a.length !== b.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return -1;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
