import { ReactiveModel } from '@beyond-js/reactive/model';
import { KnowledgeBox, Chat } from '@aimpact/chat-sdk/core';
import { sessionWrapper } from '@aimpact/chat-sdk/session';

interface IStore {}
export class StoreManager extends ReactiveModel<IStore> {
	#model: KnowledgeBox;
	get model() {
		return this.#model;
	}

	#found: boolean;
	get found() {
		return this.#found;
	}

	load = async (id: string) => {
		if (this.#model && this.#model.id !== id) {
			this.#model = undefined;
		}

		this.#model = new KnowledgeBox();
		this.#model.on('change', this.triggerEvent);

		const response = await this.#model.load({ id });

		// TODO [reactive-0.0.1] @ftovar8 @jircdev model.found siempre viene undefined
		this.#found = !!response.data;
		this.ready = true;
	};

	createChat = async (kbId: string, name: string) => {
		const chat = new Chat();
		const userId = sessionWrapper.userId;
		let specs = { userId, knowledgeBoxId: kbId, name: `[SAVED] ${name}` };
		await chat.publish(specs);
		return { status: true, chat };
	};

	saveSharedFolder = async (kbId: string, name: string) => {
		try {
			const sharedFolders = JSON.parse(localStorage.getItem('sharedFolders')) || [];
			const found = sharedFolders.find(folder => folder.id === kbId);
			if (!found) {
				sharedFolders.push({ id: kbId, path: `[SAVED] ${name}` });
				localStorage.setItem('sharedFolders', JSON.stringify(sharedFolders));
			}
		} catch (error) {
			console.error(error);
		}
	};
}
