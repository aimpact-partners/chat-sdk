import { Collection } from '@beyond-js/reactive/entities';

import { Chat } from '../item';
import { Api } from '@aimpact/http-suite/api';
import { ChatCollectionProvider } from './provider';

export /*bundle*/ class Chats extends Collection {
	constructor() {
		super({ provider: ChatCollectionProvider, localdb: false, item: Chat });
	}
}
