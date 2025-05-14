import React from 'react';
import { Alert } from 'pragmate-ui/alert';
import { useStore } from '@aimpact/chat-sdk/shared/hooks';
import type { Message } from '@aimpact/chat-sdk/core';
import { useChatMessagesContext } from '../context';

interface ErrorsRendererProps {
	message: Message;
}

export const ErrorsRenderer: React.FC<ErrorsRendererProps> = ({ message }) => {
	useStore(message, ['error.changed']);
	const { texts } = useChatMessagesContext();

	if (!message.error) return null;
	const error = message.error;
	return (
		<>
			<Alert type="error">{texts.errors.default}</Alert>
		</>
	);
};
