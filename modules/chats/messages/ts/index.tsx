import React from 'react';

import { Message } from './message';
import { Empty } from 'pragmate-ui/empty';
import { ChatMessagesContext } from './context';
export /*bundle */ function Messages({ chat, player, messages, texts, current, systemIcon }) {
	const [currentMessage, setCurrentMessage] = React.useState(current);
	1;
	const totalMessages = messages.length;
	if (!totalMessages) return <Empty text={texts.empty} />;

	const output = messages.map((message: any, i: number) => {
		return <Message key={`message-${i}`} message={message} />;
	});

	const value = { chat, player, messages, texts, currentMessage, setCurrentMessage, systemIcon };
	return (
		<ChatMessagesContext.Provider value={value}>
			<div className="messages__list">{output}</div>
		</ChatMessagesContext.Provider>
	);
}
