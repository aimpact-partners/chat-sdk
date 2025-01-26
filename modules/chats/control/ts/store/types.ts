import { Chat, Messages } from '@aimpact/chat-sdk/core';
export interface IStore {
	autoplay?: boolean;

	waitingResponse?: boolean;
	fetching?: boolean;
}
