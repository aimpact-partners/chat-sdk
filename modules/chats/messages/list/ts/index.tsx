import React from 'react';
import type { Chat, Messages as MessagesCollection, Message } from '@aimpact/chat-sdk/core';

import { MessageItemContainer } from './message';
import { Empty } from 'pragmate-ui/empty';
import { ChatMessagesContext } from './context';

export interface IMessageListProps {
	chat: Chat;
	player: any;
	showAvatar: boolean;
	messages: MessagesCollection['items'];
	texts: Record<string, any>;
	current: Message;
	setCurrentMessage: (message: Message) => void;
	systemIcon: string;
	setUpdateScroll: (scroll: number) => void;
}

export /*bundle*/ function Messages(props: IMessageListProps) {
	const { chat, player, showAvatar, messages, texts, current, systemIcon, setUpdateScroll } = props;
	const [currentMessage, setCurrentMessage] = React.useState(current);
	const totalMessages = messages.length;

	// Show empty state if there are no messages
	if (!totalMessages) return <Empty text={texts.empty} />;

	// Render each message item
	const messageItems = messages.map((message: Message, i: number) => (
		<MessageItemContainer key={`message-${i}`} message={message} setUpdateScroll={setUpdateScroll} />
	));

	// Context value for child components
	const contextValue = {
		chat,
		player,
		showAvatar,
		messages,
		texts,
		currentMessage,
		setCurrentMessage,
		systemIcon,
		setUpdateScroll
	};

	return (
		<ChatMessagesContext.Provider value={contextValue}>
			<div className="messages__list">{messageItems}</div>
		</ChatMessagesContext.Provider>
	);
}
