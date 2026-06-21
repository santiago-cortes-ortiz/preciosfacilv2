// ponytail: in-memory, single-process; no comparte estado entre instancias/serverless cold starts
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  private prune(now = Date.now()) {
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
  }

  tryAcquire(): boolean {
    const now = Date.now();
    this.prune(now);

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.prune(now);

    if (this.timestamps.length >= this.maxRequests) {
      const waitMs = this.windowMs - (now - this.timestamps[0]) + 1;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return this.acquire();
    }

    this.timestamps.push(Date.now());
  }

  get remaining(): number {
    this.prune();
    return Math.max(0, this.maxRequests - this.timestamps.length);
  }

  get retryAfterMs(): number {
    this.prune();
    if (this.timestamps.length < this.maxRequests) return 0;
    return this.windowMs - (Date.now() - this.timestamps[0]) + 1;
  }
}

export class KeyedRateLimiter {
  private limiters = new Map<string, RateLimiter>();

  private getLimiter(key: string, maxRequests: number, windowMs: number) {
    const cacheKey = `${key}:${maxRequests}:${windowMs}`;
    let limiter = this.limiters.get(cacheKey);
    if (!limiter) {
      limiter = new RateLimiter(maxRequests, windowMs);
      this.limiters.set(cacheKey, limiter);
    }
    return limiter;
  }

  tryAcquire(key: string, maxRequests: number, windowMs: number): boolean {
    return this.getLimiter(key, maxRequests, windowMs).tryAcquire();
  }

  async acquire(key: string, maxRequests: number, windowMs: number): Promise<void> {
    await this.getLimiter(key, maxRequests, windowMs).acquire();
  }

  retryAfterMs(key: string, maxRequests: number, windowMs: number): number {
    return this.getLimiter(key, maxRequests, windowMs).retryAfterMs;
  }
}
