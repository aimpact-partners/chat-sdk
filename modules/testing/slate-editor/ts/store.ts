import { BaseStoreManager } from '@aimpact/platform/stores/base';
import { module } from 'beyond_context';

export interface IStore {
	content: string;
	isEditing: boolean;
}

export class StoreManager extends BaseStoreManager<IStore> {
	declare content: string;
	declare isEditing: boolean;

	constructor() {
		super(module.specifier, {
			properties: ['content', 'isEditing']
		});
	}

	setContent(content: string): void {
		this.set({ content });
	}

	toggleEditing(): void {
		this.set({ isEditing: !this.isEditing });
	}
}
