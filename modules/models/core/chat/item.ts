// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { ChatProvider } from '@aimpact/chat-api/provider';
import { Message } from './messages/item';
import { IMessage } from './interfaces/message';
import { Messages } from './messages';

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
		const data = await collection.localLoad({ chatId: this.id });
		collection.on('change', this.triggerEvent);
		if (response.data.messages?.length) {
			await collection.setEntries(response.data.messages);
		}
		this.#messages = collection;
	};

	async setAudioMessage({ user, response }) {
		// const messageItem = new Message();
		if (this.#currentAudio.id !== user.id) {
			console.warn('son diferentes', this.#currentAudio.id, user.id);
			return;
		}
		// this.#currentAudio.set(user);
		this.#currentAudio.publish(user);

		const responseItem = new Message();
		await responseItem.isReady;

		/**
		 * Check with Felix if this is the correct way to do it
		 */

		await responseItem.publish(response);

		const finalData = { ...user };

		this.triggerEvent();

		return responseItem;
	}

	#currentAudio: Message;
	async sendAudio(audio, transcription = undefined): Promise<Message> {
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
				timestamp: Date.now(),
			};
			if (transcription) {
				specs.content = transcription;
			}

			this.#currentAudio = item;
			item.publishAudio(specs);

			this.triggerEvent();
			console.log(98, item.id, item);
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
			performance.mark('previous.create.messages');
			await Promise.all([item.isReady, response.isReady]);
			performance.mark('after.create.messages');
			// this.#messages.set(item.id, {
			// 	id: item.id,
			// 	chatId: this.id,
			// 	content,
			// 	role: 'user',
			// 	timestamp: Date.now(),
			// });
			// this.#messages.set(response.id, {
			// 	id: response.id,
			// 	chatId: this.id,
			// 	content: '',
			// 	role: 'system',
			// });

			const onListen = () => {
				response.content = item.response;
				//	this.#messages.elements(response.id).content = response.content;
			};
			const onEnd = () => {
				this.trigger('response.finished');
				item.off('content.updated', onListen);
			};
			item.on('content.updated', onListen);
			item.on('response.finished', onEnd);
			performance.mark('previous.publish.messages');
			item.publish({ chatId: this.id, content, role: 'user', timestamp: Date.now() });
			performance.mark('after.publish.messages');
			performance.measure('create.messages', 'previous.create.messages', 'after.create.messages');
			performance.measure('publish.messages', 'previous.publish.messages', 'after.publish.messages');

			response.setOffline(true);
			response.role = 'system';
			response.publishSystem();
			this.triggerEvent();

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
