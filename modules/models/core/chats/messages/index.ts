// import { MessageProvider } from '@aimpact/chat-api/provider';
import { ReactiveModel } from '@beyond-js/reactive/model';
import { Message } from './item';

export /*bundle*/ class Messages extends ReactiveModel<Messages> {
	item = Message;

	#items: Message[] = [];
	#map: Map<string, Message> = new Map();
	get items() {
		return this.#items;
	}

	#id: string;
	constructor({ chatId }) {
		super();
		this.#id = chatId;
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

	addTestMessage() {
		const message = new Message({ chatId: this.#id, role: 'system', streaming: true });
		this.add(message);

		const baseText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
		const repeatedText = baseText.repeat(5);
		const words = repeatedText.split(' ');
		let currentContent = '';
		let index = 0;

		const interval = setInterval(() => {
			if (index >= words.length) {
				clearInterval(interval);
				return;
			}

			currentContent += words[index] + ' ';

			message.set({ content: currentContent });
			index++;
		}, 100); // Add a new word every 100ms
	}

	getData() {
		return this.#items.map(item => item.getProperties());
	}

	has(id: string) {
		return this.#map.has(id);
	}
}
