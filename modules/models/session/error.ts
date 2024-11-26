export class CustomError extends Error {
	code: string;

	constructor(code: any, message: string) {
		super(message);
		this.code = code;
		this.name = 'CustomError';
	}
}
