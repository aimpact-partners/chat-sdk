// // ChatItem
// import { Item } from '@beyond-js/reactive/entities';
// import { Api } from '@jircdev/http-suite/api';
// import { Message } from '../messages/item';
// import { IMessage, IMessageSpecs } from '../interfaces/message';
// import { Messages } from '../messages';
// import { languages } from '@beyond-js/kernel/core';

// import { IChat } from '../interfaces/chat';
// import { sdkConfig } from '@aimpact/chat-sdk/startup';
// import { ChatProvider } from './provider';
// // chats/ea0572a8-ff07-4bf5-9962-16fc765603eb
// export /*bundle*/ class _Chat extends Item<IChat> {
// 	declare id: string;
// 	#api: Api;
// 	protected properties = [
// 		'id',
// 		'autoplay',
// 		'name',
// 		'userId',
// 		'system',
// 		'parent',
// 		'category',
// 		'language',
// 		'usage',
// 		'children',
// 		'knowledgeBoxId',
// 		'user',
// 		'metadata'
// 	];
// 	localdb = false;
// 	declare fetching: boolean;
// 	declare triggerEvent: () => void;

// 	#messages: Messages;
// 	get messages() {
// 		return this.#messages;
// 	}

// 	constructor({ id = undefined } = {}) {
// 		super({ id, localdb: false, provider: ChatProvider });
// 		this.#api = new Api(sdkConfig.api);
// 		this.#messages = new Messages();
// 		globalThis.chat = this;
// 		// console.log(`chat is being exposed in console as chat`, id);
// 	}

// 	loadAll = async specs => {
// 		await this.isReady;

// 		const response = await this.load(specs);
// 		const collection = this.#messages;
// 		collection.on('change', this.triggerEvent);

// 		if (response.data.messages?.length) {
// 			await collection.setEntries(response.data.messages);
// 		}
// 		this.#messages = collection;
// 		globalThis.m = collection;
// 		globalThis.c = this;
// 	};

// 	async setAudioMessage(response) {
// 		try {
// 			const responseItem = new Message({ chat: this });

// 			// await responseItem.saveMessage(response);

// 			this.triggerEvent();

// 			return responseItem;
// 		} catch (e) {
// 			console.error(e);
// 		}
// 	}

// 	#currentAudio: Message;
// 	/**
// 	 * This method saves the audio locally to be able to reproduce it.
// 	 * @param audio
// 	 * @param transcription
// 	 * @returns
// 	 */
// 	async saveAudioLocally(audio, transcription = undefined): Promise<Message> {
// 		try {
// 			const item = new Message({ chat: this });

// 			const specs: IMessage = {
// 				chat: { id: this.id },
// 				chatId: this.id,
// 				type: 'audio',
// 				audio,
// 				role: 'user',
// 				language: this.language?.default ?? languages.current
// 				// timestamp: Date.now()
// 			};
// 			if (transcription) {
// 				specs.content = transcription;
// 			}

// 			this.#currentAudio = item;
// 			// await item.saveMessage(specs);
// 			// this.setOffline(false);
// 			this.triggerEvent();

// 			return item;
// 		} catch (e) {
// 			console.error(e);
// 		}
// 	}

// 	async sendMessage(content: string | Blob) {
// 		try {
// 			this.fetching = true;
// 			console.log(20, content);
// 			const item = new Message({ chat: this });
// 			let response = new Message({ chat: this });
// 			// this.messages.add(item);
// 			// await Promise.all([item.isReady, response.isReady]);

// 			const onListen = async () => {
// 				this.trigger(`message.${response.id}.updated`);
// 				response.updateContent({ content: item.response });

// 				response.triggerEvent();
// 				this.triggerEvent();
// 			};
// 			const onEnd = () => {
// 				response.updateContent({ content: item.response });
// 				this.trigger(`message.${response.id}.ended`);
// 				this.trigger(`message.${response.id}.updated`);
// 				item.off('content.updated', onListen);
// 			};

// 			item.on('content.updated', onListen);
// 			item.on('response.finished', onEnd);

// 			const specs: IMessageSpecs = {
// 				chatId: this.id,
// 				systemId: response.id,
// 				id: item.id,
// 				// timestamp: Date.now(),
// 				role: 'user'
// 			};
// 			if (typeof content === 'string') {
// 				specs.content = content;
// 			} else {
// 				specs.multipart = true;
// 				specs.audio = content;
// 			}

// 			item.publish(specs);

// 			return { message: item, response };
// 		} catch (e) {
// 			console.error(e);
// 		} finally {
// 			this.fetching = false;
// 		}
// 	}

// 	getMessage(id: string) {
// 		return this.#messages.get(id);
// 	}
// }
