// ChatItem
import { ReactiveModel } from '@beyond-js/reactive/model';
import { v4 as uuid } from 'uuid';
import { Api } from '@jircdev/http-suite/api';
import { IMessage, IMessageConstructorSpecs } from '../interfaces/message';
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
	declare audio: Blob;
	#parsedContent: { value: string; data: any[] };
	get response() {
		return this.#response;
	}

	#type: 'message' | 'answer';
	get type() {
		return this.#type;
	}

	constructor({ id = undefined, chat, ...specs }: IMessageConstructorSpecs) {
		super({
			id,
			...specs,

			properties: ['id', 'chatId', 'audio', 'userId', 'role', 'content', 'usage', 'timestamp']
		});
		this.#chat = chat;
		if (!id) this.id = uuid();
		const api = new Api(sdkConfig.api);
		this.#api = api;
		this.#type = specs.type ?? 'message';

		this.reactiveProps(['autoplay']);
		super.ready = true;
	}
}
//
