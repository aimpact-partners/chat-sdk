// ChatItem
import { ReactiveModel } from '@beyond-js/reactive/model';

import { Api } from '@aimpact/http-suite/api';
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

			properties: ['id', 'chatId', 'audio', 'chat', 'userId', 'role', 'content', 'usage', 'timestamp']
		});
		this.#chat = chat;
		const api = new Api(sdkConfig.api);
		this.#api = api;

		this.reactiveProps(['autoplay']);
		super.ready = true;
		this.#listen();
	}

	#onListen = () => {
		this.#response = this.#api.streamResponse;
		console.log(12, 'actualizando respuesta', this.#response);
		this.trigger('content.updated');
	};
	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
	};

	#offEvents = () => {
		this.#api.off('stream.response', this.#onListen);
	};


	#processAction = () => {
		try {
			let transcription = this.#api?.actions?.find(action => {
				const data = JSON.parse(action);

				if (data.type === 'transcription') {
					return true;
				}
			});

			if (transcription) {
				// let transcriptionData: Record<string, any> = JSON.parse(transcription);
				// this.#publish({ content: transcriptionData.data.transcription });
			}
		} catch (e) {
			console.error(e);
		}
	};
	#publish(args) {}

	async updateContent(specs) {
		await this.#publish(specs);

		this.trigger(`content.updated`);
	}
}
//
