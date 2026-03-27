export type AppMode = 'b2c' | 'b2b' | 'full';

export function getAppMode(): AppMode {
  const mode = process.env.APP_MODE;
  if (mode === 'b2c' || mode === 'b2b') return mode;
  return 'full';
}
