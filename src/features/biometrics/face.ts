import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "/models";

// The bundled face-api.js type declarations only expose a minimal slice of its internal
// `tf` (tfjs-core) re-export. setBackend/ready are real, documented tfjs-core functions
// used here only as a last-resort fallback (see loadFaceModels below); this narrow type
// covers just what that fallback calls.
const tf = faceapi.tf as unknown as { setBackend(name: string): Promise<boolean>; ready(): Promise<void> };

let loadPromise: Promise<void> | null = null;

/** Loads the face detection/recognition models once and caches the promise. Safe to call repeatedly. */
async function loadNets(): Promise<void> {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
}

export function loadFaceModels(): Promise<void> {
  if (!loadPromise) {
    loadPromise = loadNets()
      .catch(async () => {
        // Almost every real browser supports WebGL, which tfjs (used internally here)
        // picks automatically. On the rare device where WebGL and WASM are both
        // unavailable (some locked-down corporate machines, old kiosks, and headless
        // test runners), fall back to the plain CPU backend - slower, but it works.
        await tf.setBackend("cpu");
        await tf.ready();
        await loadNets();
      })
      .catch((error: unknown) => {
        loadPromise = null; // allow retrying after a transient failure (e.g. flaky network)
        throw error;
      });
  }
  return loadPromise;
}

export interface FaceMatch {
  descriptor: number[];
  box: { x: number; y: number; width: number; height: number };
  score: number;
}

type FaceInput = HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;

/**
 * Single best face for enrollment / live sign-in, using the fast tiny detector - good
 * for one nearby, cooperative face from a webcam.
 */
export async function detectSingleFace(input: FaceInput): Promise<FaceMatch | null> {
  await loadFaceModels();
  const result = await faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) return null;
  const { x, y, width, height } = result.detection.box;
  return { descriptor: Array.from(result.descriptor), box: { x, y, width, height }, score: result.detection.score };
}

/**
 * Every face in a photo, using the more accurate (slower) SSD MobileNet detector - built
 * for a class photo with several people at varying distances from the camera.
 */
export async function detectAllFaces(input: FaceInput): Promise<FaceMatch[]> {
  await loadFaceModels();
  const results = await faceapi
    .detectAllFaces(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();
  return results.map((result) => {
    const { x, y, width, height } = result.detection.box;
    return { descriptor: Array.from(result.descriptor), box: { x, y, width, height }, score: result.detection.score };
  });
}

/** Loads a File (e.g. from an <input type=file>) into an HTMLImageElement for detection. */
export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not read "${file.name}" as an image.`));
    img.src = url;
  });
}
