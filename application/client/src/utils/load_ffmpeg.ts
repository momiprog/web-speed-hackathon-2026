export async function loadFFmpeg(): Promise<any> {
  const { FFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = new FFmpeg();

  await ffmpeg.load({
    coreURL: await import("@ffmpeg/core?binary").then(({ default: url }) => url as unknown as string),
    wasmURL: await import("@ffmpeg/core/wasm?binary").then(({ default: url }) => url as unknown as string),
  });

  return ffmpeg;
}
