import React from 'react';
import type { Chat, Messages as MessagesCollection, Message } from '@aimpact/chat-sdk/core';
interface IChatMessagesContext {
	chat: Chat;
	player: any;
	showAvatar: boolean;
	messages: MessagesCollection['items'];
	texts: Record<string, any>;
	currentMessage: Message;
	setCurrentMessage: (message: any) => void;
	systemIcon: string;
	setUpdateScroll: (value: number) => void;
}
export const ChatMessagesContext = React.createContext({} as IChatMessagesContext);
export const useChatMessagesContext = () => React.useContext(ChatMessagesContext);
