// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import config from '@aimpact/chat-sdk/config';
import { Api } from '@aimpact/chat-sdk/api';
import { Message } from '../messages/item';
import { IMessage, IMessageSpecs } from '../interfaces/message';
import { Messages } from '../messages';
import { languages } from '@beyond-js/kernel/core';
import { ChatProvider } from './provider';
import { IChat } from '../interfaces/chat';

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
		'ch ildren',
		'knowledgeBoxId',
		'user',
		'metadata'
	];
	localdb = false;
	declare fetching: boolean;
	declare triggerEvent: () => void;

	#messages: Messages;
	get messages() {
		return this.#messages;
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
		this.#api = new Api(config.params.apis.chat);
		globalThis.chat = this;
		// console.log(`chat is being exposed in console as chat`, id);
	}

	loadAll = async specs => {
		const response = await this.load(specs);
		const collection = new Messages();

		const data = await collection.localLoad({ chatId: this.id, sortBy: 'timestamp', limit: 1000 });
		collection.on('change', this.triggerEvent);

		if (response.data.messages?.length) {
			await collection.setEntries(response.data.messages);
		}
		this.#messages = collection;
		globalThis.m = collection;
		globalThis.c = this;
	};

	async setAudioMessage(response) {
		try {
			const responseItem = new Message();
			await responseItem.isReady;
			await responseItem.saveMessage(response);

			this.triggerEvent();

			return responseItem;
		} catch (e) {
			console.error(e);
		}
	}

	#currentAudio: Message;
	/**
	 * This method saves the audio locally to be able to reproduce it.
	 * @param audio
	 * @param transcription
	 * @returns
	 */
	async saveAudioLocally(audio, transcription = undefined): Promise<Message> {
		try {
			const item = new Message();
			await item.isReady;
			item.setOffline(true);

			const specs: IMessage = {
				chat: { id: this.id },
				chatId: this.id,
				type: 'audio',
				audio,
				role: 'user',
				language: this.language?.default ?? languages.current,
				timestamp: Date.now()
			};
			if (transcription) {
				specs.content = transcription;
			}

			this.#currentAudio = item;
			await item.saveMessage(specs);
			this.setOffline(false);
			this.triggerEvent();

			return item;
		} catch (e) {
			console.error(e);
		}
	}

	async sendMessage(content: string | Blob) {
		try {
			this.fetching = true;
			const item = new Message({ chat: this });
			let response = new Message({ chat: this });

			await Promise.all([item.isReady, response.isReady]);
			let published = false;
			const onListen = async () => {
				if (!published) {
					published = true;

					response.publishSystem({
						offline: true,
						specs: {
							chatId: this.id,
							chat: { id: this.id },
							conversation: { id: this.id },
							content: '',
							role: 'system',
							timestamp: Date.now()
						}
					});
				}

				this.trigger(`message.${response.id}.updated`);
				response.updateContent({ content: item.response });

				response.triggerEvent();
				this.triggerEvent();
			};
			const onEnd = () => {
				response.updateContent({ content: item.response });
				this.trigger(`message.${response.id}.ended`);
				this.trigger(`message.${response.id}.updated`);
				item.off('content.updated', onListen);
			};
			item.on('content.updated', onListen);
			item.on('response.finished', onEnd);

			const specs: IMessageSpecs = {
				chatId: this.id,
				systemId: response.id,
				id: item.id,
				// timestamp: Date.now(),
				role: 'user'
			};
			if (typeof content === 'string') {
				specs.content = content;
			} else {
				specs.multipart = true;
				specs.audio = content;
			}
			console.log(2);
			item.publish(specs);

			return { message: item, response };
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
		}
	}

	getMessage(id: string) {
		return this.#messages.get(id);
	}
}
