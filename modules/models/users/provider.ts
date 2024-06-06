import { Api } from '@aimpact/chat-sdk/api';
import config from '@aimpact/chat-sdk/config';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
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
