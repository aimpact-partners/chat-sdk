// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { ChatProvider } from '@aimpact/chat-api/provider';
import { Message } from './messages/item';

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
	#messages: Map<string, any> = new Map();
	get messages() {
		return [...this.#messages.values()];
	}

	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Chat', provider: ChatProvider });
	}

	loadAll = async specs => {
		const response = await this.load(specs);
		const messages = new Map();
		if (response.data.messages?.length) {
			response.data.messages.forEach(message => messages.set(message.id, message));
		}
		this.#messages = messages;
	};

	async setAudioMessage({ user, response }) {
		const messageItem = new Message();
		const responseItem = new Message();
		await Promise.all([messageItem.isReady, responseItem.isReady]);

		await messageItem.publish(user);
		await responseItem.publish(response);

		const finalData = { ...user };
		const data = this.#messages.get('temporal');
		this.#messages.set(messageItem.id, { ...finalData, id: messageItem.id, audio: data.audio });
		this.#messages.delete('temporal');

		this.#messages.set(responseItem.id, { ...response, id: responseItem.id });
		this.triggerEvent();

		return responseItem;
	}

	async sendAudio(audio, transcription = undefined) {
		const item = new Message();
		await item.isReady;
		item.setOffline(true);

		type ISpecs = {
			id: string;
			chatId: string;
			type: string;
			audio: Buffer;
			role: string;
			timestamp: number;
			content?: string;
		};
		const specs: ISpecs = {
			id: 'temporal',
			chatId: this.id,
			type: 'audio',
			audio,
			role: 'user',
			timestamp: Date.now(),
		};
		if (transcription) {
			specs.content = transcription;
		}

		this.#messages.set('temporal', specs);
		this.triggerEvent();
	}

	async sendMessage(content: string) {
		try {
			this.fetching = true;
			const item = new Message();
			let response = new Message();
			performance.mark('previous.create.messages');
			await Promise.all([item.isReady, response.isReady]);
			performance.mark('after.create.messages');
			this.#messages.set(item.id, {
				id: item.id,
				chatId: this.id,
				content,
				role: 'user',
				timestamp: Date.now(),
			});
			this.#messages.set(response.id, {
				id: response.id,
				chatId: this.id,
				content: '',
				role: 'system',
			});

			const onListen = () => {
				response.content = item.response;
				this.#messages.get(response.id).content = response.content;
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
