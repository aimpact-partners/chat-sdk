// import { MessageProvider } from '@aimpact/chat-api/provider';
import { ReactiveModel } from '@aimpact/reactive/model';
import { Message } from './item';

export /*bundle*/ class Messages extends ReactiveModel<Messages> {
	item = Message;

	#items: Message[] = [];
	#map: Map<string, Message> = new Map();
	get items() {
		return this.#items;
	}

	constructor() {
		super();
	}

	setEntries(data) {
		this.#items = data.map(item => {
			const message = new Message(item);
			this.#map.set(message.id, message);
			return message;
		});
	}

	get(id: string) {
		return this.#map.get(id);
	}

	add(item) {
		this.#items.push(item);
		this.#map.set(item.id, item);

		this.trigger('new.message');
	}

	getData() {
		return this.#items.map(item => item.getProperties());
	}

	has(id: string) {
		return this.#map.has(id);
	}
}
