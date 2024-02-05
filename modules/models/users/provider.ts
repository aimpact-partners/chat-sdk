import { Api } from '@aimpact/chat-sdk/api';
import config from '@aimpact/chat-sdk/config';

export class UserProvider {
	#api: Api;

	constructor() {
		this.#api = new Api(config.params.apis.chat);
	}

	async load(specs) {
		this.#api.bearer(specs.firebaseToken);

		const { status, data } = await this.#api.post('/auth/login', specs);
		if (!status) {
			throw new Error('error loading chat');
		}

		return { status, data };
	}
}
