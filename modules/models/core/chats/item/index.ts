import { Item } from '@beyond-js/reactive/entities/item';
import { PendingPromise } from '@beyond-js/kernel/core';
// ChatItem

import { Api } from '@beyond-js/http-suite/api';
import { Message } from '../messages/item';
import { Messages } from '../messages';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { IChat, IChatUsage } from '../interfaces/chat';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
import { ChatProvider } from './provider';
import { v4 as uuid } from 'uuid';

export /*bundle*/ class Chat extends Item<IChat> {
	declare id: string;
	declare fetching: boolean;
	declare triggerEvent: () => void;
	declare language: any;
	declare audioplay: boolean;
	declare userId: string;
	declare system: string;
	declare parent: string;
	declare category: any;
	declare usage: IChatUsage;
	declare children: any;
	declare user: any;
	declare knowledgeBoxId: string;
	declare metadata: any;
	#api: Api;
	get api() {
		return this.#api;
	}

	#errors: any[] = [];
	get errors() {
		return this.#errors;
	}

	#currentMessage: Message;
	#response: Message;
	#messages: Messages;

	get messages() {
		return this.#messages;
	}

	constructor({ id = undefined, ...specs } = {}) {
		super({
			id,
			entity: 'Chat',
			...specs,
			properties: [
				'id',
				'autoplay',
				'name',
				'userId',
				'system',
				'parent',
				'category',
				'language',
				'usage',
				'user',
				'children',
				'knowledgeBoxId',
				'metadata'
			],

			provider: ChatProvider
		});

		this.#api = new Api(sdkConfig.api);

		globalThis.chat = this;
		if (!id) this.id = uuid();
		this.#listen();

		this.#messages = new Messages({ chatId: this.id });
		this.#messages.on('new.message', () => {
			this.trigger('new.message');
		});
		// console.log(`chat is being exposed in console as chat`, id);
	}

	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
		this.#api.on('action.received', data => {
			if (data) {
				try {
					const parsed = JSON.parse(data);

					this.trigger('action.received', parsed.metadata);
				} catch (e) {
					console.warn('the data coudnt be parsed', data);
				}
			}
			try {
				if (this.#api.actions) {
					this.#api.actions.forEach(data => {
						const action = JSON.parse(data);
						if (action.type === 'transcription') {
							this.#currentMessage.set({ content: action.data.transcription, streaming: false });
							//once the transcription is received, we add the system message to the chat
							if (this.#response && !this.#messages.has(this.#response.id))
								this.messages.add(this.#response);
						}
					});
				}
				// const action = JSON.parse(this.#api.actions);
			} catch (e) {
				console.error(e);
			}
		});
	};

	loadAll = async specs => {
		const response = await this.load(specs);
		const collection = this.#messages;
		collection.on('change', this.triggerEvent);

		if (response.messages?.length) {
			await collection.setEntries(response.messages);
		}
		this.ready = true;
		this.trigger('change');
		this.#messages = collection;
	};

	#onListen = () => {
		if (!this.#response) return;
		this.#response.content = this.#api.streamResponse;

		this.#response.set({ content: this.#api.stringContent, actions: this.#api.actions });

		// this.#response.publish();
		this.trigger('content.updated');
	};

	getData() {
		const properties = this.getProperties();
		properties.messages = this.#messages.getData();
		return properties;
	}
	async sendMessage(content: string): Promise<Message> {
		try {
			this.fetching = true;
			const token = await sessionWrapper.user.firebaseToken;
			const uri = `/chats/${this.id}/messages`;
			const promise = new PendingPromise<Message>();
			const item = new Message({ chatId: this.id, role: 'user', content });
			this.#currentMessage = item;
			const onFinish = async response => {
				this.trigger('response.finished');
				await this.#response.set({ streaming: false });

				this.#response = undefined;

				promise.resolve(item);

				// this.#offEvents();
			};

			this.#response = new Message({ chatId: this.id, role: 'system', streaming: true });
			this.messages.add(item);
			this.messages.add(this.#response);
			const onError = e => {
				this.#errors.push(e);
				this.#response.set({ error: e });
				console.error(`onError`, e);
			};
			await this.#api
				.bearer(token)
				.stream(uri, { ...item.getProperties() })
				.then(onFinish)
				.catch(onError);

			return promise;
		} catch (e) {
			console.error(`capturamos error en el modelo`, e);
		} finally {
			this.fetching = false;
		}
	}

	async sendAudio(message: Blob): Promise<Message> {
		try {
			this.fetching = true;
			const token = await sessionWrapper.user.firebaseToken;
			const uri = `/chats/${this.id}/messages/audio`;
			const promise = new PendingPromise<Message>();
			const item = new Message({ chatId: this.id, audio: message, role: 'user', streaming: true });
			this.#currentMessage = item;
			const onFinish = async response => {
				await this.#response.set({ streaming: false });
				this.trigger('response.finished');
				// this.#response = undefined;
				promise.resolve(item);

				// this.#offEvents();
			};
			const onError = e => {
				console.error(e);
			};
			this.messages.add(item);
			this.#response = new Message({ chatId: this.id, role: 'system', streaming: true });
			const specs = {
				...item.getProperties(),
				audio: new File([item.audio], 'audio.mp4', { type: 'audio/mp4' }),
				multipart: true
			};

			this.#api.bearer(token).stream(uri, specs).then(onFinish).catch(onError);
			globalThis.setTimeout(() => onFinish({}), 3000); // TODO: remove this
			return promise;
		} catch (e) {
			throw new Error(e);
			console.error(e);
		} finally {
			this.fetching = false;
		}
	}

	async transcribe(audio: Blob) {
		try {
			const uri = `/audios/transcribe`;
			const token = await sessionWrapper.user.firebaseToken;
			const response = await this.#api.bearer(token).post(uri, { multipart: true, audio: audio });

			return response;
		} catch (e) {
			//todo: how to handle other kind of errors
			throw e;
		}
	}

	getMessage(id: string) {
		return this.#messages.get(id);
	}

	response(data) {
		return {
			status: true,
			data
		};
	}

	async create() {
		const response = await this.#api.post('/chats', {
			id: this.id,
			name: 'My chat',
			projectId: '02d991dd-8d57-42f3-b155-8e7133482c19',
			uid: sessionWrapper.user.id,
			metadata: {
				prompt: 'topic-q&a'
			},
			language: {
				default: 'es'
			}
		});
		this.set(response.data);
	}
}
