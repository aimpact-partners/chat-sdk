import { ReactiveProps } from '@aimpact/chat-sdk/reactive/model';
import type { Item } from './index';
export /*bundle*/ type ItemId = string | number;
export /*bundle*/ interface IItemProps<P extends IEntityProvider> {
	id?: ItemId;
	provider: new (parent: Item) => P;
	entity: string;
	properties: any;
}

export interface IItemProviderResponse<T> {
	status: number;
	data?: T;
	error?: string;
	errors?: Array<{
		field: string;
		message: string;
	}>;
}
export /*bundle*/ interface IEntityProvider {
	load?(specs?: any): Promise<any>;
	list?(specs?: any): Promise<any>;
	// save?(data: any): Promise<any>;
	publish?(data: any): Promise<any>;
	remove?(specs: any): Promise<any>;
	delete?(specs?: any): Promise<any>;
}

export /*bundle*/ type IRecordProps = {
	id: ItemId;
	properties: any;
	[key: string]: any;
};
