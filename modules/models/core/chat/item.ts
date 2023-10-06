// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { ChatProvider } from '@aimpact/chat-api/provider';
import { Message } from './messages/item';
import { IMessage } from './interfaces/message';
import { Messages } from './messages';
import { languages } from '@beyond-js/kernel/core';

interface IChat {
	id: string;
	name: string;
	userId: string;
	category: string;
	system: string;
	parent: string;
	knowledgeBoxId: string;
	usage: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
	metadata: {};
}

export /*bundle*/ class Chat extends Item<IChat> {
	declare id: string;
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
		'metadata',
	];
	localdb = false;
	declare fetching: boolean;
	declare triggerEvent: () => void;
	declare provider: any;
	#messages: Messages;
	get messages() {
		return this.#messages;
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}

	loadAll = async specs => {
		const response = await this.load(specs);
		const messages = new Map();
		const collection = new Messages();

		const data = await collection.localLoad({ conversationId: this.id, sortBy: 'timestamp' });
		collection.on('change', this.triggerEvent);

		if (response.data.messages?.length) {
			await collection.setEntries(response.data.messages);
		}
		this.#messages = collection;
		window.m = collection;
		window.c = this;
	};

	async setAudioMessage({ user, response }) {
		const responseItem = new Message();
		await responseItem.isReady;
		await responseItem.saveMessage(response);

		this.triggerEvent();

		return responseItem;
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
				timestamp: Date.now(),
			};
			if (transcription) {
				specs.content = transcription;
			}

			this.#currentAudio = item;
			item.publishAudio(specs);

			this.triggerEvent();

			return item;
		} catch (e) {
			console.error(e);
		}
	}

	async sendMessage(content: string) {
		try {
			this.fetching = true;
			const item = new Message();
			let response = new Message();

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
							content: '',
							role: 'system',
							timestamp: Date.now(),
						},
					});
				}
				response.updateContent({ content: item.response });

				response.triggerEvent();
				this.triggerEvent();
				//	this.#messages.elements(response.id).content = response.content;
			};
			const onEnd = () => {
				this.trigger('response.finished');
				response.publishSystem({
					specs: { chatId: this.id, chat: { id: this.id }, role: 'system', timestamp: Date.now() },
				});
				item.off('content.updated', onListen);
			};
			item.on('content.updated', onListen);
			item.on('response.finished', onEnd);

			item.publish({ chatId: this.id, content, role: 'user', timestamp: Date.now() });

			return { message: item, response };

			this.triggerEvent();
			// return { response: response.data.response, message: response.data.message };
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
