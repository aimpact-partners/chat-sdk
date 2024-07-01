import React from 'react';
import { parseText } from '@aimpact/chat-sdk/widgets/playable';
import { MessageText } from './components/text';
import { MessageActions } from './actions';
import { ProfileIcon } from './components/profile-icon';
import { SystemActions } from './system-actions';
import { useChatMessagesContext } from '../context';
import { useMessage } from './use-message';

export function Message({ message }) {
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
				<MessageText playable={true} message={message} fetching={fetching} />
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

// export const Message = React.memo(MessageComponent);
