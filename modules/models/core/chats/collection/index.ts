import { ReactiveModel } from '@aimpact/reactive/model';
import { Api } from '@aimpact/http-suite/api';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
export /*bundle*/ class Chats extends ReactiveModel<Chats> {
	#api: Api;

	constructor() {
		super();
		this.#api = new Api(sdkConfig.api);
	}

	#items: any[] = [];
	get items() {
		return this.#items;
	}
	async load() {
		const token = await sessionWrapper.user.firebaseToken;
		this.#api.bearer(token);
		const { status, data } = await this.#api.get(`/chats`);
		if (!status) {
			throw new Error('error loading chat');
		}
		this.#items = data.items;

		return { status, data };
	}

	async addItem(item) {
		this.#items.unshift(item);
		this.triggerEvent('change');
	}
}
