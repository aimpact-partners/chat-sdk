import React from 'react';
import type { StoreManager } from '../store';
import type { Chats } from '@aimpact/chat-sdk/core';

export interface IConversationsContext {
	chats: Chats;
	totalChats?: number;

	store: StoreManager;
	showChildren?: boolean;
	openDialog?: () => void;
	closeDialog?: () => void;
}

export interface IItemConversation {
	item?: any;
	isCurrent?: boolean;
	isParent?: boolean;
	setExpanded?: (boolean) => void;
	expanded?: boolean;
	editing?: boolean;

	setEditing?: (boolean) => void;
	chatId?: string;
}

export const ConversationsContext = React.createContext({} as IConversationsContext);
export const useConversationsContext = () => React.useContext(ConversationsContext);

export const ItemConversationsContext = React.createContext({} as IItemConversation);
export const useItemConversationsContext = () => React.useContext(ItemConversationsContext);
