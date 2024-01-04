// ChatItem
import { Item } from '@beyond-js/reactive/entities';

import { Api } from '@aimpact/chat-sdk/api';
import config from '@aimpact/chat-sdk/config';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { IMessage } from '../interfaces/message';
import { PendingPromise } from '@beyond-js/kernel/core';
import { Chat } from '../item';

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = ['id', 'chatId', 'audio', 'chat', 'userId', 'role', 'content', 'usage', 'timestamp'];
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

	constructor({ id = undefined, chat } = {}) {
		super({ id, db: 'chat-api', storeName: 'Messages' });
		this.#chat = chat;
		const api = new Api(config.params.apis.chat);
		this.#api = api;

		this.reactiveProps(['autoplay']);
		this.#listen();
		this.initialise();
	}

	async initialise() {
		super.initialise();
		//await this.isReady;
		//this.#processContent();
	}

	#onListen = () => {
		this.#response = this.#api.streamResponse;

		this.trigger('content.updated');
	};
	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
	};

	#offEvents = () => {
		this.#api.off('stream.response', this.#onListen);
	};

	//@ts-ignore
	async publish(specs): Promise<any> {
		try {
			this.setOffline(true);
			const promise = new PendingPromise();
			const token = await sessionWrapper.user.firebaseToken;

			this.#api
				.bearer(token)
				.stream(`/chats/${this.#chat.id}/messages`, {
					...specs
				})
				.then(response => {
					this.trigger('response.finished');
					this.#offEvents();
				})
				.catch(e => {
					console.error(e);
				});

			/**
			 * @todo: Julio, the next code probably can be removed;
			 * I don't know what transcription is or where is used
			 */
			this.#api.on('action.received', () => {
				try {
					let transcription = this.#api?.actions?.find(action => {
						const data = JSON.parse(action);

						if (data.type === 'transcription') {
							return true;
						}
					});

					if (transcription) {
						transcription = JSON.parse(transcription);
						super.publish({ content: transcription.data.transcription });
					}
				} catch (e) {
					console.error(e);
				}
			});
			super.publish(specs);
			return promise;
		} catch (e) {
			console.trace(e);
		}
	}

	async publishSystem({ offline, specs }: { offline?: boolean; specs?: {} }) {
		this.setOffline(offline);
		super.publish(specs);
	}

	async updateContent(specs) {
		this.setOffline(true);
		//@ts-ignore
		await super.publish(specs);

		this.trigger(`content.updated`);
	}
}
//
