const durationPattern = /^(\d+)(ms|s|m|h|d)$/;

const multipliers: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function durationToMilliseconds(duration: string): number {
  const match = durationPattern.exec(duration.trim());

  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }

  const [, value, unit] = match;

  return Number(value) * multipliers[unit];
}
