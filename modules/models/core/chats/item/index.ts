import { audio } from './../../../../../../api/modules/http/routes/chats/messages/audio';
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
		this.#listen();
		// console.log(`chat is being exposed in console as chat`, id);
	}

	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
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
		if (!this.#response) {
			this.#response = new Message({ chatId: this.id, role: 'system' });
			this.#messages.add(this.#response);
		}

		// this.#response.content = this.#api.streamResponse;

		this.#response.set({ content: this.#api.streamResponse });

		// this.#response.publish();
		this.trigger('content.updated');
	};

	async sendMessage(content: string): Promise<Message> {
		try {
			this.fetching = true;
			const token = await sessionWrapper.user.firebaseToken;
			const uri = `/chats/${this.id}/messages`;
			const promise = new PendingPromise<Message>();
			const item = new Message({ chatId: this.id, content });
			const onFinish = response => {
				this.trigger('response.finished');
				this.#response = undefined;
				promise.resolve(item);
				// this.#offEvents();
			};
			const onError = e => {
				console.error(e);
			};

			this.messages.add(item);
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
			const onFinish = response => {
				this.trigger('response.finished');
				this.#response = undefined;
				promise.resolve(item);
				// this.#offEvents();
			};
			const onError = e => {
				console.error(e);
			};

			this.messages.add(item);
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
		const uri = `/audios/transcribe`;
		const token = await sessionWrapper.user.firebaseToken;
		const response = await this.#api.bearer(token).post(uri, { multipart: true, audio: audio });
		console.log(10, response);
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
