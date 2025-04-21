import { AppError, IAppErrorOptions } from './';
/**
 * Canonical authentication error codes used by the application.
 */
export enum AuthErrorCode {
	POPUP_CLOSED = 'POPUP_CLOSED_BY_USER',
	USER_CANCEL = 'USER_CANCEL',
	EXPIRED_TOKEN = 'EXPIRED_TOKEN',
	UNAUTHORIZED = 'UNAUTHORIZED',
	UNKNOWN = 'UNKNOWN'
}

/**
 * Error thrown when an authentication operation fails.
 */
export class AuthError extends AppError {
	constructor(code: AuthErrorCode, opts: Omit<IAppErrorOptions, 'code'> = {}) {
		super({ code, ...opts });
	}
}
