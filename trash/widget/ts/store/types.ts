import { Chat, Messages } from '@aimpact/chat-sdk/core';
export interface IStore {
	autoplay?: boolean;
	messages: Messages;
	waitingResponse?: boolean;
	fetching?: boolean;
}
