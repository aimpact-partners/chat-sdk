import { DBManager } from '@beyond-js/reactive/database';
import { PendingPromise } from '@beyond-js/kernel/core';
// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { Api } from '@jircdev/http-suite/api';
import { Message } from '../messages/item';
import { Messages } from '../messages';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { IChat } from '../interfaces/chat';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
import { ChatProvider } from './provider';
import { v4 as uuid } from 'uuid';
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
	#currentMessage: Message;
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
		if (!id) this.id = uuid();
		this.#listen();
		// console.log(`chat is being exposed in console as chat`, id);
	}

	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
		this.#api.on('action.received', () => {
			try {
				if (this.#api.actions) {
					this.#api.actions.forEach(data => {
						const action = JSON.parse(data);
						if (action.type === 'transcription') {
							this.#currentMessage.set({ content: action.data.transcription });
						}
					});
				}
				// const action = JSON.parse(this.#api.actions);
			} catch (e) {
				console.log('no ta listo', e);
			}
		});
	};

	#offEvents = () => {
		this.#api.off('stream.response', this.#onListen);
	};

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
		this.#response.content = this.#api.streamResponse;

		this.#response.set({ content: this.#api.streamResponse });

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
			const item = new Message({ chatId: this.id, content });
			this.#currentMessage = item;
			const onFinish = response => {
				this.trigger('response.finished');
				this.#response = undefined;
				promise.resolve(item);
				this.saveLocally(this.getData());
				// this.#offEvents();
			};
			const onError = e => {
				console.error(e);
			};

			this.#response = new Message({ chatId: this.id, role: 'system' });
			this.messages.add(item);
			this.messages.add(this.#response);

			this.#api
				.bearer(token)
				.stream(uri, { ...item.getProperties() })
				.then(onFinish)
				.catch(onError);

			return promise;
		} catch (e) {
			console.error(e);
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
			const item = new Message({ chatId: this.id, audio: message });
			this.#currentMessage = item;
			const onFinish = response => {
				this.trigger('response.finished');
				this.#response = undefined;
				promise.resolve(item);
				this.saveLocally(this.getData());
				// this.#offEvents();
			};
			const onError = e => {
				console.error(e);
			};
			this.messages.add(item);
			this.#response = new Message({ chatId: this.id, role: 'system' });
			this.messages.add(this.#response);
			this.#api
				.bearer(token)
				.stream(uri, { ...item.getProperties(), multipart: true })
				.then(onFinish)
				.catch(onError);
			globalThis.setTimeout(() => onFinish({}), 3000);
			return promise;
		} catch (e) {
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

	async saveLocally(data: any) {
		try {
			return null;
			const existingData = await DBManager.db.table('Chat').get(data.id);
			if (existingData) {
				await DBManager.db.table('Chat').update(data.id, data);
			} else {
				await DBManager.db.table('Chat').put(data);
			}
		} catch (error) {
			console.error('Error saving locally:', error);
		}
	}

	async loadLocally(chatId: string): Promise<any> {
		try {
			const data = await DBManager.db.table('Chat').get(chatId);
			return data;
		} catch (error) {
			console.error('Error loading locally:', error);
		}
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
