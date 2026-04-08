declare module 'gif-encoder-2' {
  class GIFEncoder {
    constructor(width: number, height: number, algorithm?: string, useOptimizer?: boolean, totalFrames?: number);
    start(): void;
    setDelay(ms: number): void;
    setRepeat(repeat: number): void;
    setQuality(quality: number): void;
    addFrame(pixels: Buffer | Uint8ClampedArray): void;
    finish(): void;
    readonly out: { getData(): Buffer };
  }
  export = GIFEncoder;
}
