import { Collection } from '@beyond-js/reactive/entities';
import { ChatProvider } from '@aimpact/chat-api/provider';
import { Chat } from './item';

interface IChats {
	items: Chat[];
}

export /*bundle*/ class Chats extends Collection {
	item = Chat;
	constructor() {
		super({ provider: ChatProvider, storeName: 'Chat', db: 'chat-api' });
	}
}
