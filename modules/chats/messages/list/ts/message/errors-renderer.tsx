import { BsArrowCounterclockwise } from 'react-icons/bs';
import React from 'react';
import { Alert } from 'pragmate-ui/alert';
import { useStore } from '@aimpact/chat-sdk/shared/hooks';
import type { Message } from '@aimpact/chat-sdk/core';
import { useChatMessagesContext } from '../context';
import { Button } from 'pragmate-ui/components';
import { AppButton } from '@aimpact/chat-sdk/components/icons';

interface ErrorsRendererProps {
	message: Message;
}

export const ErrorsRenderer: React.FC<ErrorsRendererProps> = ({ message }) => {
	const { chat } = useChatMessagesContext();
	useStore(message, ['error.changed']);
	const { texts } = useChatMessagesContext();
	const onRetry = () => chat.retry(message.id);
	if (!message.error) return null;

	return (
		<div className="message__error">
			<Alert type="error">
				<div>{texts.errors.default}</div>
				<div className="error__actions">
					<Button onClick={onRetry}>
						<BsArrowCounterclockwise />
						{texts.actions.retry}
					</Button>
				</div>
			</Alert>
		</div>
	);
};
