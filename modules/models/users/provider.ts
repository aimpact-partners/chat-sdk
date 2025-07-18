import { sdkConfig } from '@aimpact/chat-sdk/startup';
import { Api } from '@beyond-js/http-suite/api';

export class UserProvider {
	#api: Api;

	constructor() {
		this.#api = new Api(sdkConfig.api);
	}

	async load(specs) {
		this.#api.bearer(specs.firebaseToken);

		const { status, data } = await this.#api.post('/auth/login', specs);

		if (!status) {
			throw new Error('error loading user data');
		}

		return { status, data };
	}
}
