import type { Chat, Message, Messages as MessagesCollection } from '@aimpact/chat-sdk/core';
import { Voice } from '@aimpact/chat-sdk/voice';
import React from 'react';
interface IChatMessagesContext {
	chat: Chat;
	player: Voice;
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
