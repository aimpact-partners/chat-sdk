import { config } from '@aimpact/chat-sdk/config';

export /*bundle*/ class ConversationQuery extends Events {
	#chatId: string;
	#prompt: string;
	#bearerToken: string;

	#processing = false;
	get processing() {
		return this.#processing;
	}

	#processed = false;
	get processed() {
		return this.#processed;
	}

	#answer: string = '';
	get answer() {
		return this.#answer;
	}

	#metadata: { started: boolean; value: string; parsed: { value: object | undefined; error?: string } } = {
		started: false,
		value: '',
		parsed: { value: void 0 }
	};
	get metadata(): { value: object | undefined; error?: string } | undefined {
		return this.#metadata.parsed;
	}

	#error?: string;
	get error() {
		return this.#error;
	}

	get valid() {
		return !this.#error;
	}

	constructor(chatId: string, prompt: string, bearerToken: string) {
		super();
		this.#chatId = chatId;
		this.#prompt = prompt;
		this.#bearerToken = bearerToken;
	}

	async sendMessage() {
		if (this.#processed || this.#processing) throw new Error(`Message already sent`);

		this.#processing = true;
		this.trigger('change');

		const host = config.CHAT_API_HOST;
		const chatId = this.#chatId;
		const bearerToken = this.#bearerToken;
		const url = `${host}/conversation/${chatId}/messages`;
		const method = 'POST';
		const headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${bearerToken}` // This is the line you add
		};

		// Prepare the parameters
		const prompt = this.#prompt;
		const body = JSON.stringify({ prompt });

		const done = ({ error }: { error?: string }) => {
			this.#error = error;

			this.#processed = true;
			this.#processing = false;
		};

		// Fetch the agent
		let response: any;
		try {
			response = await fetch(url, { method, headers, body });
		} catch (exc) {
			console.error(exc);
			return done({ error: 'Failed to post message' });
		}

		// Check if response is ok
		if (!response.ok) {
			const { status, statusText } = response;

			if (status === 400) {
				const json = await response.json();
				return done({ error: `Failed to post message (${status}): "${json.error}"` });
			} else {
				return done({ error: `Failed to post message (${status}): "${statusText}"` });
			}
		}

		const metadata = this.#metadata;

		// Use the response body as a stream
		const reader = response.body.getReader();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// Process each chunk
			const chunk = new TextDecoder().decode(value);
			if (!metadata.started) {
				if (!chunk.includes('ÿ')) {
					this.#answer += chunk;
				} else {
					metadata.started = true;
					const split = chunk.split('ÿ');
					metadata.value += split[1];
					if (split[0]) this.#answer += split[0];
				}
			} else {
				metadata.value += chunk;
			}
		}

		// Parse the metadata data
		try {
			metadata.parsed.value = JSON.parse(metadata.value);
		} catch (exc) {
			console.error(exc);
			this.#metadata.parsed.error = 'Error parsing metadata';
		}
	}
}
