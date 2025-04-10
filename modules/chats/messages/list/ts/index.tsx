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

export /*bundle */ function Messages({
	chat,
	player,
	showAvatar,
	messages,
	texts,
	current,
	systemIcon,
	setUpdateScroll
}: IMessageListProps) {
	const [currentMessage, setCurrentMessage] = React.useState(current);
	1;
	const totalMessages = messages.length;
	if (!totalMessages) return <Empty text={texts.empty} />;

	const output = messages.map((message: any, i: number) => {
		return <MessageItemContainer key={`message-${i}`} message={message} setUpdateScroll={setUpdateScroll} />;
	});

	const value = {
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
		<ChatMessagesContext.Provider value={value}>
			<div className="messages__list">{output}</div>
		</ChatMessagesContext.Provider>
	);
}
