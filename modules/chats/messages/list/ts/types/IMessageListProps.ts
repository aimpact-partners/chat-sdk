import type { Chat, Messages as MessagesCollection, Message } from '@aimpact/chat-sdk/core';

export interface IMessageListProps {
	chat: Chat;
	player: any;
	showAvatar: boolean;
	messages: MessagesCollection['items'];
	texts: Record<string, any>;
	current: Message;
	systemIcon?: string;
	setUpdateScroll: (scroll: number) => void;
	error?: any;
}
