import { Message } from '@aimpact/chat-sdk/chat/messages/item';
import { parseText } from '@aimpact/chat-sdk/widgets/playable';
import React from 'react';
import { useChatMessagesContext } from '../context';
import { MessageActions } from './actions';
import { ProfileIcon } from './components/profile-icon';
import { ErrorsRenderer } from './errors-renderer';
import { SystemActions } from './system-actions';

export function MessageItemContainer({ message, setUpdateScroll }) {
	const { showAvatar, texts, chat } = useChatMessagesContext();
	const cls = `message__container message__container--${message.role}${showAvatar ? `has-avatar` : ''}`;
	const messageTokens = message.role === 'assistant' ? message.usage?.totalTokens : null;
	const ACTIONS = ['transcription', 'fetching-tool-data', 'kb-processed-response', 'function', 'kb-response'];
	const [, playableContent, actions] = parseText(message.id, message.content, ACTIONS);

	return (
		<div className={cls} data-id={message.id}>
			{showAvatar && <ProfileIcon role={message.role} />}
			<section className="message__content">
				<SystemActions actions={actions} />
				{!message.error && (
					<Message message={message} setUpdateScroll={setUpdateScroll} texts={texts.message} />
				)}
				<MessageActions message={message} text={playableContent} messageTokens={messageTokens} />
				<ErrorsRenderer message={message} />
			</section>
		</div>
	);
}
