export {};

declare global {
  interface Window {
    confetti?: (options?: {
      particleCount?: number;
      spread?: number;
      startVelocity?: number;
      origin?: { x?: number; y?: number };
      colors?: string[];
      disableForReducedMotion?: boolean;
    }) => Promise<void> | null;
  }
}
