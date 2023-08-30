// ChatItem
import { Item } from '@beyond-js/reactive/entities';
import { MessageProvider } from '@aimpact/chat-api/provider';
import { Api } from '@aimpact/chat-sdk/api';
import config from '@aimpact/chat-sdk/config';
import { sessionWrapper } from '@aimpact/chat-sdk/session';

interface IMessage {
	chatId: string;
	userId: string;
	content: string;
	role: string;
	timestamp: number;
	usage: {
		completionTokens: number;
		promptTokens: number;
		totalTokens: number;
	};
}

export /*bundle*/ class Message extends Item<IMessage> {
	protected properties = ['id', 'chatId', 'userId', 'role', 'content', 'usage', 'timestamp'];
	declare autoplay: boolean;

	declare id: string;
	declare triggerEvent: () => void;
	#api: Api;
	#response: string = '';
	get response() {
		return this.#response;
	}
	constructor({ id = undefined } = {}) {
		super({ id, db: 'chat-api', storeName: 'Messages', provider: MessageProvider });
		const api = new Api(config.params.apis.chat);
		this.#api = api;

		this.reactiveProps(['autoplay']);
		this.#listen();
	}

	#onListen = () => {
		this.#response = this.#api.streamResponse;
		this.trigger('content.updated');
	};
	#listen = () => {
		this.#api.on('stream.response', this.#onListen);
	};

	#offEvents = () => {
		this.#api.off('stream.response', this.#onListen);
	};
	//@ts-ignore
	async publish(specs): Promise<any> {
		try {
			this.setOffline(true);
			const token = await sessionWrapper.user.firebaseToken;
			this.#api
				.bearer(token)
				.stream(`/conversations/${specs.chatId}/messages`, { message: specs.content })
				.then(response => {
					this.trigger('response.finished');
					this.#offEvents();
				});

			super.publish();
		} catch (e) {
			console.trace(e);
		}
	}

	async publishSystem() {
		this.setOffline(true);
		super.publish();
	}
}
