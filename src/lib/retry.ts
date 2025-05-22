/**
 * Options for the retry mechanism
 */
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 300,
  maxDelay: 5000,
  timeout: 30000
};

/**
 * Error indicating that a function timed out
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Adds a timeout to a promise
 * @param promise - The promise to add a timeout to
 * @param ms - The timeout in milliseconds
 * @param errorMessage - The error message to use if the timeout is reached
 * @returns A promise that will reject if the timeout is reached
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError(errorMessage)), ms);
  });

  return Promise.race([
    promise.then((value) => {
      clearTimeout(timeoutId);
      return value;
    }),
    timeoutPromise,
  ]);
}

/**
 * Retries a function with exponential backoff
 * @param fn - The function to retry
 * @param options - Retry options
 * @returns The result of the function
 * @throws The last error encountered if all retries fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts: Required<RetryOptions> = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options
  };

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < opts.maxRetries) {
    try {
      // Add timeout to the function call
      return await withTimeout(
        fn(),
        opts.timeout,
        `Operation timed out after ${opts.timeout}ms`
      );
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on timeout errors
      if (error instanceof TimeoutError) {
        break;
      }
      
      attempt++;
      
      if (attempt >= opts.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        opts.retryDelay * Math.pow(2, attempt) * (0.9 + Math.random() * 0.2),
        opts.maxDelay
      );
      
      console.log(`Retry attempt ${attempt}/${opts.maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Retry failed after maximum attempts');
}