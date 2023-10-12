import { ReactiveModel } from '@beyond-js/reactive/model';
import { PendingPromise } from '@beyond-js/kernel/core';
interface headers {
	'Content-Type': string;
}

interface session {
	accessToken: string;
}

export /*bundle*/
class JCall extends ReactiveModel<JCall> {
	#streamResponse: string = '';
	#SEPARATORS = {
		METADATA: 'ÿ',
		START: '😸',
		END: '🖋️',
	};

	#actions = [];
	get actions() {
		return this.#actions;
	}
	get streamResponse() {
		return this.#streamResponse;
	}

	#metadata: { started: boolean; value: string; parsed: { value: object | undefined; error?: string } } = {
		started: false,
		value: '',
		parsed: { value: void 0 },
	};
	get metadata(): { value: object | undefined; error?: string } | undefined {
		return this.#metadata.parsed;
	}

	#response;
	#bearer;
	bearer(bearer: string | undefined) {
		if (bearer) this.#bearer = bearer;
		return this;
	}

	getHeaders = (specs: any, multipart): Headers => {
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

		if (multipart) {
			console.log(90, 'here');
			headers.delete('Content-Type');
		}

		return headers;
	};

	#formData: FormData;
	formData = (specs: Record<string, any>): FormData => {
		this.#formData = new FormData();
		const keys: string[] = Object.keys(specs);
		keys.forEach((key: string): void => {
			this.#formData.append(key, specs[key]);
		});
		return this.#formData;
	};

	#processGetParams(params: Record<string, string>): URLSearchParams | string {
		const emptyParams: boolean = Object.entries(params).length === 0 && params.constructor === Object;
		if (emptyParams) return '';
		const parameters: URLSearchParams = new URLSearchParams();
		for (const key in params) {
			if (![NaN, undefined, ''].includes(params[key])) {
				parameters.append(key, params[key]);
			}
		}
		return parameters;
	}

	#processPostParams = (params, multipart): FormData | string => {
		const emptyParams: boolean = Object.entries(params).length === 0 && params.constructor === Object;
		if (emptyParams) return;

		if (multipart) {
			const data = this.formData(params);
			return data;
		}

		return JSON.stringify(params);
	};
	execute = async (
		url: string,
		method: string = 'get',
		params: Record<string, any> = {},
		headersSpecs?: object,
		stream?: boolean,
		data?: FormData
	): Promise<any> => {
		try {
			if (!headersSpecs) {
				headersSpecs = {};
			}
			const multipart = params.multipart;
			let headers = this.getHeaders({ ...headersSpecs, bearer: params.bearer }, multipart);
			delete params.multipart;
			delete params.bearer;

			const specs: RequestInit = { method, headers, mode: 'cors' };

			if (params.bearer) delete params.bearer;

			if (method === 'post') {
				specs.body = this.#processPostParams(params, multipart);
			} else if (method === 'get') {
				const queryString: string = this.#processGetParams(params).toString();
				if (queryString) url += `?${queryString}`;
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

	#processStream = (promise, metadata) => {
		try {
			metadata.parsed.value = JSON.parse(metadata.value);
		} catch (exc) {
			console.error(exc);
			this.#metadata.parsed.error = 'Error parsing metadata';
		}

		promise.resolve({
			value: this.#streamResponse,
			...metadata.parsed.value,
		});
		this.#streamResponse = undefined;
	};

	async #stream(url, specs) {
		const promise = new PendingPromise();
		const response: Response = await fetch(url, specs);

		if (!response.ok) {
			throw new Error('error in stream');
		}
		const reader = response.body?.getReader();

		const metadata = this.#metadata;
		let tool = '';
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				return this.#processStream(promise, metadata);
			}
			let chunk = new TextDecoder().decode(value);

			const processStartTool = (tool, chunk) => {
				const splitted = chunk.split(this.#SEPARATORS.START);
				if (splitted.length > 0) {
					tool = splitted[1];
					chunk = splitted[0];
				}
				return [tool, chunk];
			};

			if (chunk.includes(this.#SEPARATORS.METADATA)) {
				metadata.started = true;
				const split = chunk.split(this.#SEPARATORS.METADATA);
				metadata.value += split[1];
				if (split[0]) this.#streamResponse += split[0];
			}

			if (metadata.started) {
				metadata.value += chunk;
				this.triggerEvent('stream.response');
				return;
			}

			if (chunk.includes(this.#SEPARATORS.END)) {
				[tool, chunk] = processStartTool(tool, chunk);
				const splitted = tool.split(this.#SEPARATORS.END);
				tool = splitted[0];
				chunk = splitted[1];
				this.#actions.push(tool);
				this.triggerEvent('action.received');
				this.#streamResponse += this.#SEPARATORS.START + tool + this.#SEPARATORS.END;
				tool = '';
			}

			if (chunk.includes(this.#SEPARATORS.START)) {
				[tool, chunk] = processStartTool(tool, chunk);
			} else {
				this.#streamResponse += chunk;
			}

			this.triggerEvent('stream.response');
		} // end while

		return promise;

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
