// ChatItem
import { ReactiveModel } from '@beyond-js/reactive/model';
import { v4 as uuid } from 'uuid';
import { Api } from '@beyond-js/http-suite/api';
import { IMessage, IMessageSpecs } from '../interfaces/message';
import type { Chat } from '../item';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
import type { Messages } from './';

export /*bundle*/ class Message extends ReactiveModel<IMessage> implements Partial<IMessage> {
	declare autoplay: boolean;
	declare error: any;
	declare id: string;
	declare transcribing: boolean;
	declare triggerEvent: () => void;
	#api: Api;
	#response: string = '';
	//#endregion
	#chat: Chat;
	declare content: string;
	declare metaDataStarted: boolean;
	declare streaming: boolean;
	declare messages: Messages;
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

	#previous;
	get previous() {
		return this.#previous;
	}

	set previous(value) {
		if (value === this.#previous) return;
		this.#previous = value;
		this.trigger('previous.changed');
	}

	constructor({ id = undefined, chat, ...specs }: Partial<IMessageSpecs>) {
		super({
			id,
			...specs,
			properties: [
				'id',
				'chatId',
				'audio',
				'userId',
				'role',
				'content',
				'usage',
				'timestamp',
				'streaming',
				'transcribing',
				'actions'
			]
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
