import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import Meyda from "meyda";

const TARGET_SAMPLE_RATE = 16000;
const FRAME_SIZE = 1024;
const HOP_SIZE = 512;
const MFCC_COEFFICIENTS = 13;
const MIN_VOICED_FRAMES = 6; // ~0.4s of audio at this hop size; guards against empty/silent clips

/** Decodes any audio format ffmpeg understands into 16kHz mono PCM16 via a subprocess. */
function decodeToPcm16Mono(inputBuffer) {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegPath, [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      "pipe:0",
      "-f",
      "s16le",
      "-ac",
      "1",
      "-ar",
      String(TARGET_SAMPLE_RATE),
      "pipe:1",
    ]);
    const chunks = [];
    const errChunks = [];
    ff.stdout.on("data", (chunk) => chunks.push(chunk));
    ff.stderr.on("data", (chunk) => errChunks.push(chunk));
    ff.on("error", reject);
    ff.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with code ${code}: ${Buffer.concat(errChunks).toString("utf8").slice(0, 300)}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
    ff.stdin.on("error", () => {
      /* ffmpeg closing stdin early on a malformed file is reported via the close handler above */
    });
    ff.stdin.end(inputBuffer);
  });
}

function pcm16ToFloat32(pcmBuffer) {
  const sampleCount = Math.floor(pcmBuffer.length / 2);
  const samples = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i += 1) {
    samples[i] = pcmBuffer.readInt16LE(i * 2) / 32768;
  }
  return samples;
}

/**
 * Extracts a fixed-length "voiceprint": the mean MFCC vector across all frames of the
 * clip that carry meaningful energy (near-silent frames are skipped). Same idea as an
 * audio fingerprint - simple, dependency-light (pure JS, no native ML runtime needed,
 * see README for why), and good enough to tell speakers apart on a short fixed phrase.
 * Throws if the clip is empty, unreadable, or has too little voiced audio to trust.
 */
export async function extractVoiceprint(audioBuffer) {
  const pcm = await decodeToPcm16Mono(audioBuffer);
  const samples = pcm16ToFloat32(pcm);

  const sums = new Float64Array(MFCC_COEFFICIENTS);
  let voicedFrames = 0;

  for (let start = 0; start + FRAME_SIZE <= samples.length; start += HOP_SIZE) {
    const frame = samples.subarray(start, start + FRAME_SIZE);
    let energy = 0;
    for (let i = 0; i < frame.length; i += 1) energy += frame[i] * frame[i];
    const rms = Math.sqrt(energy / frame.length);
    if (rms < 0.006) continue; // treat as silence/background noise, skip

    const features = Meyda.extract(["mfcc"], frame, { sampleRate: TARGET_SAMPLE_RATE, bufferSize: FRAME_SIZE });
    if (!features?.mfcc) continue;
    for (let c = 0; c < MFCC_COEFFICIENTS; c += 1) sums[c] += features.mfcc[c];
    voicedFrames += 1;
  }

  if (voicedFrames < MIN_VOICED_FRAMES) {
    const error = new Error("The recording is too short or too quiet to read. Please try again.");
    error.code = "AUDIO_TOO_QUIET";
    throw error;
  }

  return Array.from(sums, (s) => s / voicedFrames);
}
