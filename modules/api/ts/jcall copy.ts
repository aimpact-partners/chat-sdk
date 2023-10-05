import { ReactiveModel } from '@beyond-js/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
interface headers {
	'Content-Type': string;
}

interface session {
	accessToken: string;
}

type MetaData = { started: boolean; value: string; parsed: { value: object | undefined; error?: string } };

export /*bundle*/
class JCall2 extends ReactiveModel<JCall> {
	#SEPARATORS = {
		METADATA: 'ÿ',
		START: '😸',
		END: '🖋️',
	};
	#streamResponse: string = '';
	get streamResponse() {
		return this.#streamResponse;
	}

	#metadata: MetaData = {
		started: false,
		value: '',
		parsed: { value: void 0 },
	};

	#toolsInformation: MetaData[];
	get metadata(): { value: object | undefined; error?: string } | undefined {
		return this.#metadata.parsed;
	}

	#response;
	#bearer;
	bearer(bearer: string | undefined) {
		if (bearer) this.#bearer = bearer;
		return this;
	}
	/**
	 *  @deprecated
	 */
	checkToken = (headers: any): any => {
		if (typeof window === 'undefined') return headers;
		let session: string = window.localStorage.getItem('session');
		if (!session) return headers;
		const sessionObject: session = JSON.parse(session);
		headers.append('Authorization', `Bearer ${sessionObject.accessToken}`);
		return headers;
	};

	getHeaders = (specs: any): Headers => {
		let headers: Headers = new Headers();

		const bearer = specs.bearer || this.#bearer;

		if (bearer) {
			headers.append('Authorization', `Bearer ${bearer}`);
		}
		if (specs.bearer) delete specs.bearer;

		const keys: string[] = Object.keys(specs);
		keys.forEach((key: string): void => {
			if (key === 'bearer') return;
			headers.append(key, specs[key]);
		});
		return headers;
	};
	execute = async (
		url: string,
		method: string = 'get',
		params: Record<string, any> = {},
		headersSpecs?: object = {},
		stream?: boolean
	): Promise<any> => {
		try {
			let headers = this.getHeaders({ ...headersSpecs, bearer: params.bearer });
			delete params.bearer;

			const specs: RequestInit = { method, headers, mode: 'cors' };

			const emptyParams: boolean = Object.entries(params).length === 0 && params.constructor === Object;
			if (params.bearer) delete params.bearer;
			if (method === 'post' && !emptyParams) {
				specs.body = JSON.stringify(params);
			} else if (!emptyParams && method === 'get') {
				const parameters: URLSearchParams = new URLSearchParams();
				for (const key in params) {
					if (![NaN, undefined, ''].includes(params[key])) {
						parameters.append(key, params[key]);
					}
				}
				const queryString: string = parameters.toString();
				if (queryString) {
					url += `?${queryString}`;
				}
			}

			if (stream) return this.#stream(url, specs);

			const response: Response = await fetch(url, specs);
			return response.json();
		} catch (e) {
			console.error('error jcall', e);
		}
	};

	stream = (
		url: string,
		params: object,
		headers: headers = {
			'Content-Type': 'application/json',
		}
	) => this.execute(url, 'post', params, headers, true);

	async #stream(url, specs) {
		try {
			const promise = new PendingPromise();
			const response: Response = await fetch(url, specs);

			if (!response.ok) {
				throw new Error('error in stream');
			}
			const reader = response.body?.getReader();

			const metadata = this.#metadata;
			//{ started: boolean; value: string; parsed: { value: object | undefined; error?: string } };
			let tool = { started: false, value: '', parsed: { value: undefined, error: undefined } };
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					promise.resolve(value);
					this.#streamResponse = undefined;
					break;
				}
				const chunk = new TextDecoder().decode(value);

				if (metadata.started) {
					metadata.value += chunk;
					continue;
				}
				if (!chunk.includes(this.#SEPARATORS.METADATA)) {
					this.#streamResponse += chunk;
					continue;
				}

				if (chunk.includes(this.#SEPARATORS.START)) {
					const splitted = chunk.split(this.#SEPARATORS.START);

					if (splitted.length > 0) {
						this.#streamResponse += splitted[0];
						tool.started = true;
						tool.value += splitted[1].replace(this.#SEPARATORS.START, '');
					} else {
						tool.started = true;
						tool.value += splitted[0].replace(this.#SEPARATORS.START, '');
					}

					continue;
				}

				if (chunk.includes(this.#SEPARATORS.END)) {
					const splitted = chunk.split(this.#SEPARATORS.END);

					tool.value += splitted[0];
					tool.parsed = JSON.parse(tool.value);
					this.#toolsInformation.push(tool);
					tool = { started: false, value: '', parsed: { value: undefined, error: undefined } };
					continue;
				}

				metadata.started = true;
				const split = chunk.split(this.#SEPARATORS.METADATA);
				metadata.value += split[1];
				if (split[0]) this.#streamResponse += split[0];

				this.triggerEvent('stream.response');
			} // end while

			try {
				metadata.parsed.value = JSON.parse(metadata.value);
			} catch (exc) {
				console.error(exc);
				this.#metadata.parsed.error = 'Error parsing metadata';
			}
			return promise;
		} catch (e) {
			console.error(e);
		}

		// Parse the metadata data
	}

	get = (url: string, params: object, headers: object) => {
		return this.execute(url, 'get', params);
	};
	post = (
		url: string,
		params: object,
		headers: headers = {
			'Content-Type': 'application/json',
		}
	) => this.execute(url, 'post', params, headers);
	delete = (
		url: string,
		params: object,
		headers: headers = {
			'Content-Type': 'application/json',
		}
	) => this.execute(url, 'DELETE', params, headers);
	put = (
		url: string,
		params: object,
		headers: headers = {
			'Content-Type': 'application/json',
		}
	) => this.execute(url, 'PUT', params, headers);
}
