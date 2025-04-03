import React from 'react';

interface IChatMessagesContext {
	player: any;
	chat: any;
	messages: any[];
	texts: Record<string, any>;
	currentMessage: any;
	setUpdateScroll: (value: number) => void;
	setCurrentMessage: (message: any) => void;
	showAvatar: boolean;
	systemIcon: string;
}
export const ChatMessagesContext = React.createContext({} as IChatMessagesContext);
export const useChatMessagesContext = () => React.useContext(ChatMessagesContext);
