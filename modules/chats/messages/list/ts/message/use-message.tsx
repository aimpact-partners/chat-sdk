import React from 'react';
import { useChatMessagesContext } from '../context';

export function useMessage(message) {
	const [fetching, setFetching] = React.useState<boolean>(false);
	const [content, setContent] = React.useState<string>(message?.content ?? '');
	const { chat } = useChatMessagesContext();
	React.useEffect(() => {
		const onUpdate = () => {
			setFetching(true);

			setContent(message.content);
		};
		const onEnd = () => {
			setContent(message.content);
			setFetching(false);
		};
		chat.on(`message.${message.id}.updated`, onUpdate);
		chat.on(`message.${message.id}.ended`, onEnd);
		return () => {
			chat.off(`message.${message.id}.updated`, onUpdate);
			chat.off(`message.${message.id}.ended`, onEnd);
		};
	}, []);

	return { fetching, setFetching, content, setContent };
}
