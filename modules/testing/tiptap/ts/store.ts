export interface IStore {
	content: string;
	isEditing: boolean;
}

export class StoreManager {
	declare content: string;
	declare isEditing: boolean;
	isStore = true;
}
