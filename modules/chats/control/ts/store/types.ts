import { Chat } from '@aimpact/chat-sdk/core';

export interface IStore {
	autoplay?: boolean;
	fetching?: boolean;
}

export interface IChatSpecs {
	id: string;
	language: string;
	realtime?: boolean;
	model?: Chat;
	onListenChat?: (data: any) => void;
}
