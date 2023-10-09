// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import config from '@aimpact/chat-sdk/config';
// import { ChatProvider } from '@aimpact/chat-api/provider';
import { Api } from '@aimpact/chat/api';
import { Message } from './messages/item';
import { IMessage } from './interfaces/message';
import { Messages } from './messages';
import { languages } from '@beyond-js/kernel/core';
import { ChatProvider } from './provider';
import { sessionWrapper } from '@aimpact/chat-sdk/session';

interface IMessageSpecs {
	systemId: string;
	id: string;
	role: string;
	content?: string;
	audio?: Blob;
}
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
		'metadata',
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
	}

	loadAll = async specs => {
		const response = await this.load(specs);
		const collection = new Messages();

		const data = await collection.localLoad({ conversationId: this.id, sortBy: 'timestamp' });
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
				conversationId: this.id,
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
							conversationId: this.id,
							chat: { id: this.id },
							conversation: { id: this.id },
							content: '',
							role: 'system',
							timestamp: Date.now(),
						},
					});
				}
				response.updateContent({ content: item.response });

				response.triggerEvent();
				this.triggerEvent();
			};
			const onEnd = () => {
				this.trigger('response.finished');
				response.updateContent({ content: item.response });

				item.off('content.updated', onListen);
			};
			item.on('content.updated', onListen);
			item.on('response.finished', onEnd);

			const specs: IMessageSpecs = {
				systemId: response.id,
				id: item.id,
				role: 'user',
			};
			if (typeof content === 'string') {
				specs.content = content;
			} else {
				specs.audio = content;
			}
			console.log(99, specs);
			response = await item.publish(specs);

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
