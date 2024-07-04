import { Collection } from '@beyond-js/reactive/entities';
// import { MessageProvider } from '@aimpact/chat-api/provider';
import { Message } from './item';
import { ReactiveModel } from '@beyond-js/reactive/model';

interface IMessages {
	items: Message[];
}

export class Messages extends ReactiveModel<Messages> {
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
		console.log(1, 'mensaje enviado agregado');
		this.trigger('new.message');
	}
}
