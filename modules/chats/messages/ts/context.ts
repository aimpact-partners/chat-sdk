import React from 'react';

interface IChatMessagesContext {
	player: any;
	chat: any;
	messages: any[];
	texts: Record<string, any>;
	currentMessage: any;
	setCurrentMessage: (message: any) => void;
}
export const ChatMessagesContext = React.createContext({} as IChatMessagesContext);
export const useChatMessagesContext = () => React.useContext(ChatMessagesContext);
