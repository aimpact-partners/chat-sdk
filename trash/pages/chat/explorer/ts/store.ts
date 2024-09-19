import { ReactiveModel } from '@beyond-js/reactive/model';
import { Chat, Chats, IChatProperties } from '@aimpact/chat-sdk/core';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { languages } from '@beyond-js/kernel/core';

interface IStore {}
export interface IMessages {
	role: 'user' | 'system';
	chats: Chats;
}
export class StoreManager extends ReactiveModel<IStore> {
	get chats() {
		return AppWrapper.chats;
	}

	get currentChat() {
		return AppWrapper.currentChat;
	}
	constructor() {
		super();
		AppWrapper.on('change', this.triggerEvent);
	}

	isReady() {
		return AppWrapper.ready;
	}
	save = async (name: string, knowledgeBoxId: string) => {
		const chat = new Chat();
		const userId: string = sessionWrapper.userId;
		let specs: IChatProperties = {
			name,
			userId,
			language: {
				default: languages.current
			}
		};

		if (knowledgeBoxId) specs.knowledgeBoxId = knowledgeBoxId;

		await chat.publish(specs);

		return { status: true, chat };
	};

	edit = async (id, name) => {
		const chat = new Chat();
		await chat.load({ id });
		const savedChat = await chat.save({ name });
		return { status: true, savedChat };
	};
}
