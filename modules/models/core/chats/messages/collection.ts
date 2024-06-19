import { Collection } from '@beyond-js/reactive/entities';
import { Message } from './item';

interface IChats {
	items: Message[];
}

export class Messages extends Collection {
	item = Message;

	constructor() {
		super({ localdb: false });
		this.init();
	}
}
