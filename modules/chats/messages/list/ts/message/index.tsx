import React from 'react';
import { parseText } from '@aimpact/chat-sdk/widgets/playable';
import { MessageActions } from './actions';
import { ProfileIcon } from './components/profile-icon';
import { SystemActions } from './system-actions';
import { useMessage } from './use-message';
import { Message } from '@aimpact/chat-sdk/chat/messages/item';

export function MessageItemContainer({ message }) {
	const { fetching } = useMessage(message);
	const cls = `message__container ${message.role}`;
	const messageTokens = message.role === 'assistant' ? message.usage?.totalTokens : null;
	const ACTIONS = ['transcription', 'fetching-tool-data', 'kb-processed-response', 'function', 'kb-response'];
	const [, playableContent, actions] = parseText(message.id, message.content, ACTIONS);

	return (
		<div className={cls} data-id={message.id}>
			<ProfileIcon role={message.role} />
			<section className="message__content">
				<SystemActions actions={actions} message={message} />
				<Message message={message} fetching={fetching} />
				<section className="message__actions">
					<MessageActions
						play={!message.audio}
						message={message}
						text={playableContent}
						messageTokens={messageTokens}
					/>
				</section>
			</section>
		</div>
	);
}
