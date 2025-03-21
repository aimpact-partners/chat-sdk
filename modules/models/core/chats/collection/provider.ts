import { Api } from '@beyond-js/http-suite/api';

import { ICollectionProvider } from '@aimpact/reactive/entities/collection';
import type { Chats } from './index';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
export class ChatCollectionProvider implements Partial<ICollectionProvider> {
	#api: Api;
	#parent: Chats;

	constructor(parent: Chats) {
		this.#api = new Api(sdkConfig.api);
		this.#parent = parent;
	}

	async list() {
		const token = await sessionWrapper.user.firebaseToken;
		this.#api.bearer(token);
		const { status, data } = await this.#api.get(`/chats`);
		if (!status) {
			throw new Error('error loading chat');
		}
		return { status, data };
	}
}
