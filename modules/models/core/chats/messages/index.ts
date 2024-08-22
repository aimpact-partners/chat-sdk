import { Collection } from '@beyond-js/reactive/entities';
// import { MessageProvider } from '@aimpact/chat-api/provider';
import { Message } from './item';
import { ReactiveModel } from '@beyond-js/reactive/model';

interface IMessages {
	items: Message[];
}

export class Messages extends ReactiveModel<Collection> {
	item = Message;

	#items: Message[];
	get items() {
		return this.#items;
	}
	constructor() {
		super({ localdb: false });
	}

	add(item) {
		this.#items.push(item);
		this.trigger('change');
	}

	setEntries(items) {
		this.#items = items;
		this.trigger('change');
	}
}
