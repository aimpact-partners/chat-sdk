import React from 'react';

import { Message } from './message';
import { Empty } from 'pragmate-ui/empty';
import { ChatMessagesContext } from './context';
export /*bundle */ function Messages({ chat, player, messages, texts, current }) {
	const [currentMessage, setCurrentMessage] = React.useState(current);
	1;
	const totalMessages = messages.length;
	if (!totalMessages) return <Empty text={texts.empty} />;

	console.log('total mensajes', totalMessages);
	const output = messages.map((message: any, i: number) => {
		return <Message key={`message-${i}`} message={message} />;
	});

	const value = { chat, player, messages, texts, currentMessage, setCurrentMessage };
	return (
		<ChatMessagesContext.Provider value={value}>
			<div className="messages__list">{output}</div>
		</ChatMessagesContext.Provider>
	);
}
