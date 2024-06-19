import { Collection } from '@beyond-js/reactive/entities';

import { Chat } from '../item';
import { Api } from '@aimpact/chat-sdk/api';
import { ChatCollectionProvider } from './provider';

export /*bundle*/ class Chats extends Collection {
	item = Chat;
	constructor() {
		super({ provider: ChatCollectionProvider, localdb: false });
	}
}
