// ChatItem
import { ReactiveModel } from '@beyond-js/reactive/model';

import { Api } from '@jircdev/http-suite/api';
import config from '@aimpact/chat-sdk/config';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { IMessage, IMessageConstructorSpecs } from '../interfaces/message';
import { PendingPromise } from '@beyond-js/kernel/core';
import type { Chat } from '../item';
import { sdkConfig } from '@aimpact/chat-sdk/startup';

export /*bundle*/ class Message extends ReactiveModel<IMessage> {
	declare autoplay: boolean;

	declare id: string;
	declare triggerEvent: () => void;
	#api: Api;
	#response: string = '';
	//#endregion
	#chat: Chat;
	localFields = ['audio'];
	#parsedContent: { value: string; data: any[] };
	get response() {
		return this.#response;
	}

	constructor({ id = undefined, chat, ...specs }: IMessageConstructorSpecs) {
		super({
			id,
			...specs,

			properties: ['id', 'chatId', 'audio', 'userId', 'role', 'content', 'usage', 'timestamp']
		});
		this.#chat = chat;
		const api = new Api(sdkConfig.api);
		this.#api = api;

		this.reactiveProps(['autoplay']);
		super.ready = true;
	}
}
//
