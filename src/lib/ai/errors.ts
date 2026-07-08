export class AIError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "AIError";
  }
}

export class AIRateLimitError extends AIError {
  constructor(provider: string, message = "Rate limit exceeded", originalError?: unknown) {
    super(message, provider, "RATE_LIMIT_EXCEEDED", originalError);
    this.name = "AIRateLimitError";
  }
}

export class AIAuthenticationError extends AIError {
  constructor(provider: string, message = "Authentication failed", originalError?: unknown) {
    super(message, provider, "AUTHENTICATION_FAILED", originalError);
    this.name = "AIAuthenticationError";
  }
}

export class AICancellationError extends AIError {
  constructor(provider: string, message = "Generation cancelled by user", originalError?: unknown) {
    super(message, provider, "CANCELLED", originalError);
    this.name = "AICancellationError";
  }
}
