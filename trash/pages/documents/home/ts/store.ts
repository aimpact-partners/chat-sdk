import { ReactiveModel } from '@beyond-js/reactive/model';
import { sessionWrapper } from '@aimpact/chat-sdk/session';

interface IStore {}

const acceptedDocuments = [
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'text/plain',
	'application/pdf'
];
export class StoreManager extends ReactiveModel<IStore> {
	#kb;
	#documents;
	#acceptedDocuments = acceptedDocuments;
	#sharedFolders = [];
	get acceptedDocuments() {
		return this.#acceptedDocuments;
	}

	get documents() {
		return this.#documents;
	}

	#items = [];
	get items() {
		return this.#items;
	}

	get collection() {
		return this.#kb;
	}

	get sharedFolders() {
		return this.#sharedFolders;
	}

	constructor() {
		super();

		this.load();
	}

	async load() {
		try {
			this.fetching = true;
			await this.#kb.load({ userId: sessionWrapper.user.id });
			this.#items = this.#kb.items;

			this.#sharedFolders = JSON.parse(localStorage.getItem('sharedFolders')) || [];
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = false;
			this.ready = true;
		}
	}

	async remove(path: string) {
		try {
			return this.#documents.remove({ path, userId: sessionWrapper.userId });
		} catch (e) {
			console.error(e);
		}
	}
}
