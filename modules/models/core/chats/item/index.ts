// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { Api } from '@aimpact/http-suite/api';
import { Message } from '../messages/item';
import { PendingPromise } from '@beyond-js/kernel/core';
import { Messages } from '../messages';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { IChat } from '../interfaces/chat';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
import { ChatProvider } from './provider';
// chats/ea0572a8-ff07-4bf5-9962-16fc765603eb
export /*bundle*/ class Chat extends Item<IChat> {
	declare id: string;
	#api: Api;
	protected properties = [
		'id',
		'autoplay',
		'name',
		'userId',
		'system',
		'parent',
		'category',
		'language',
		'usage',
		'children',
		'knowledgeBoxId',
		'user',
		'metadata'
	];
	localdb = false;
	declare fetching: boolean;
	#response: Message;
	#messages: Messages;
	get messages() {
		return this.#messages;
	}

	constructor({ id = undefined } = {}) {
		super({ id, localdb: false, provider: ChatProvider });
		this.#api = new Api(sdkConfig.api);
		this.#messages = new Messages();
		this.#messages.on('new.message', () => this.triggerEvent('new.message'));
		globalThis.chat = this;
		// console.log(`chat is being exposed in console as chat`, id);
	}

	loadAll = async specs => {
		await this.isReady;

		const response = await this.load(specs);
		const collection = this.#messages;
		collection.on('change', this.triggerEvent);

		if (response.data.messages?.length) {
			await collection.setEntries(response.data.messages);
		}
		this.#messages = collection;
		globalThis.m = collection;
		globalThis.c = this;
	};

	#onListen = () => {
		if (!this.#response) {
			this.#response = new Message({ chat: this });
		}

		// this.#response.content = this.#api.streamResponse;

		console.log(12, 'actualizando respuesta', this.#response);
		this.trigger('content.updated');
	};
	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
	};

	#offEvents = () => {
		this.#api.off('stream.response', this.#onListen);
	};

	async sendMessage(content: string) {
		try {
			this.fetching = true;

			const item = new Message({ chat: this, content });
			this.messages.add(item);

			const promise = new PendingPromise();
			const token = await sessionWrapper.user.firebaseToken;
			const uri = `/chats/${this.id}/messages`;
			const onFinish = response => {
				console.log(12, 'response', response);
				this.trigger('response.finished');
				// this.#offEvents();
			};
			const onError = e => {
				console.error(e);
			};

			this.#api
				.bearer(token)
				.stream(uri, { ...item.getProperties() })
				.then(onFinish)
				.catch(onError);
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
		}
	}

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
	getMessage(id: string) {
		return this.#messages.get(id);
	}
}
