import { AppError, IAppErrorOptions } from './';

/**
 * Canonical backend / network error codes used by the application.
 */
export enum BackendErrorCode {
	BAD_REQUEST = 'BAD_REQUEST', // 400
	UNAUTHENTICATED = 'UNAUTHENTICATED', // 401
	FORBIDDEN = 'FORBIDDEN', // 403
	NOT_FOUND = 'NOT_FOUND', // 404
	SERVER_ERROR = 'SERVER_ERROR', // 5xx
	NETWORK_ERROR = 'NETWORK_ERROR', // network / timeout
	UNKNOWN = 'UNKNOWN'
}

/**
 * Additional metadata accepted by the {@link BackendError} constructor.
 */
export interface IBackendErrorOptions extends Omit<IAppErrorOptions, 'code'> {
	/** Code can be provided but will be overridden by constructor parameter */
	code?: string;
	/** HTTP status code, if applicable. */
	status?: number;
	/** Request URL that triggered the error. */
	endpoint?: string;
	/** HTTP method used (GET, POST, …). */
	method?: string;
}

/**
 * Error representing a failure while communicating with the backend.
 */
export class BackendError extends AppError {
	public readonly status?: number;
	public readonly endpoint?: string;
	public readonly method?: string;

	constructor(code: BackendErrorCode, options: IBackendErrorOptions = {}) {
		super({ ...options, code });
		this.status = options.status;
		this.endpoint = options.endpoint;
		this.method = options.method;
	}
}
