import { Api } from '@aimpact/chat-sdk/api';
import config from '@aimpact/chat-sdk/config';
import { IProvider } from '@beyond-js/reactive/entities';
import type { Chat } from './index';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
export class ChatProvider implements IProvider {
	#api: Api;
	#parent: Chat;

	constructor(parent: Chat) {
		this.#api = new Api(config.params.apis.chat);
		this.#parent = parent;
	}

	async load(specs) {
		const token = await sessionWrapper.user.firebaseToken;

		this.#api.bearer(token);
		const { status, data } = await this.#api.get(`/chats/${this.#parent.id}`);
		if (!status) {
			throw new Error('error loading chat');
		}

		return { status, data };
	}
}
