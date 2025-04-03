import React from 'react';

import { MessageItemContainer } from './message';
import { Empty } from 'pragmate-ui/empty';
import { ChatMessagesContext } from './context';

export /*bundle */ function Messages({
	chat,
	player,
	showAvatar,
	messages,
	texts,
	current,
	systemIcon,
	setUpdateScroll
}) {
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
