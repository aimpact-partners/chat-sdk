import { Collection } from '@beyond-js/reactive/entities';
import { MessageProvider } from '@aimpact/chat-api/provider';
import { Message } from './item';

interface IMessages {
	items: Message[];
}

export class Messages extends Collection {
	item = Message;

	constructor() {
		super({ provider: MessageProvider, storeName: 'Messages', db: 'chat-api' });
	}
}
