// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { MessageProvider } from '@aimpact/chat-api/provider';
import { Api } from '@aimpact/chat-sdk/api';
import config from '@aimpact/chat-sdk/config';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { IMessage } from '../interfaces/message';
import { PendingPromise } from '@beyond-js/kernel/core';
import { Chat } from '../item';

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = [
		'id',
		'chatId',
		'audio',
		'chat',
		'userId',
		'role',
		'content',
		'usage',
		'timestamp',
		'conversationId',
	];
	declare autoplay: boolean;

	declare id: string;
	declare triggerEvent: () => void;
	#api: Api;
	#response: string = '';
	//#endregion
	#chat: Chat;
	localFields = ['audio'];
	get response() {
		return this.#response;
	}

	constructor({ id = undefined, chat } = {}) {
		super({ id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider });
		this.#chat = chat;
		const api = new Api(config.params.apis.chat);
		this.#api = api;

		this.reactiveProps(['autoplay']);
		this.#listen();
		this.initialise();
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

	async getResponse() {}
	//@ts-ignore
	async publish(specs): Promise<any> {
		try {
			this.setOffline(true);
			const promise = new PendingPromise();
			const token = await sessionWrapper.user.firebaseToken;

			const endpoint = {
				text: 'messages',
				audio: `messages/audio`,
			};
			const url = `/conversations/${this.#chat.id}/${specs.audio ? endpoint.audio : endpoint.text}`;

			this.#api
				.bearer(token)
				.stream(url, {
					...specs,
				})
				.then(response => {
					promise.resolve(response);
					this.trigger('response.finished');
					this.#offEvents();
				})
				.catch(e => {
					console.error(e);
				});
			console.log(0.1, 'publicamos', specs);
			super.publish(specs);
			return promise;
		} catch (e) {
			console.trace(e);
		}
	}

	/**
	 * This method publishes the audio message as item
	 *
	 * It does not saves the audio itself, it only saves the item or document,
	 * @param specs
	 * @returns
	 */
	async publishAudio(specs) {
		this.setOffline(true);
		return super.publish(specs);
	}

	/**
	 * This method publishes the audio message as item
	 *
	 * It does not saves the audio itself, it only saves the item or document,
	 * @param specs
	 * @returns
	 */
	async saveMessage(specs) {
		return super.publish(specs);
	}

	/**
	 * This method publishes the audio message as item
	 *
	 * It does not saves the audio itself, it only saves the item or document,
	 * @param specs
	 * @returns
	 */
	async syncMessage(specs) {
		let data = { ...specs };
		delete data.offline;
		return super.forceSync(specs);
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
