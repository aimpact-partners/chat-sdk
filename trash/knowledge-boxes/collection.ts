import { Collection } from '@beyond-js/reactive/entities';

import { KnowledgeBox } from './item';
import { Api } from '@aimpact/http-suite/api';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import config from '@aimpact/chat-sdk/config';
import { sdkConfig } from '@aimpact/chat-sdk/startup';
export /*bundle*/ class KnowledgeBoxes extends Collection {
	item = KnowledgeBox;
	#api;
	#project: string;
	#url = config.params.DOCUMENTS_SERVER;
	get api() {
		return this.#api;
	}
	constructor() {
		super({ storeName: 'KnowledgeBoxes', localdb: false, db: 'chat-api' });
		this.#api = new Api(sdkConfig.api);
		this.#project = config.params.project;
	}

	async list(filter: string | undefined) {
		try {
			this.fetching = true;
			const specs = { type: 'files', userId: sessionWrapper.userId, project: this.#project };
			if (filter) specs['filter'] = filter;
			const response = await this.#api.get('/list', specs);
			if (!response.status) throw new Error(response.error);
			return response.data;
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = true;
		}
	}

	async remove(path: string) {
		try {
			if (!path) {
				return { status: false, error: 'No path provided' };
			}
			this.fetching = true;
			const specs = { userId: sessionWrapper.userId, project: this.#project };
			const response = await this.#api.delete('/delete', specs);
			if (!response.status) throw new Error(response.error);
			return response.data;
		} catch (e) {
			console.error(e);
		} finally {
			this.fetching = true;
		}
	}
}
