/**
 * Options accepted by the {@link AppError} constructor.
 */
export /*bundle*/ interface IAppErrorOptions {
	/** Stable, app‑level identifier (e.g. `NETWORK_ERROR`). */
	code: string;
	/** User‑friendly or developer‑friendly message. */
	message?: string;
	/** Indicates whether the failed operation can be retried safely. */
	retriable?: boolean;
	/** Extra debugging information (endpoint, query, payload, …). */
	context?: Record<string, unknown>;
	/** Original error thrown by an SDK, fetch, etc. */
	cause?: unknown;
}

/**
 * Base error type shared across the application.
 * Designed to run in both browser and Node environments.
 */
export /*bundle*/ class AppError extends Error {
	public readonly code: string;
	public readonly retriable: boolean;
	public readonly context?: Record<string, unknown>;
	public readonly cause?: unknown;

	constructor({ code, message, retriable = false, context, cause }: IAppErrorOptions) {
		super(message ?? code);
		this.name = new.target.name;
		this.code = code;
		this.retriable = retriable;
		this.context = context;
		this.cause = cause;
	}
}
