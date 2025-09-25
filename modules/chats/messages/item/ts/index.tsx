import { Message as MessageModel } from '@aimpact/chat-sdk/core';
import { useStore } from '@aimpact/chat-sdk/shared/hooks';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';
import * as React from 'react';
import * as dayjs from 'dayjs';

export /*bundle*/ function Message({
	message,
	setUpdateScroll
}: {
	message: MessageModel;
	setUpdateScroll: (now: number) => void;
	texts: Record<string, any>;
}) {
	useStore(message, ['streaming', 'change', 'transcribing.changed', 'metadata.started']);

	React.useEffect(() => {
		setUpdateScroll(performance.now());

		// streaming text animation
	}, [message.content, setUpdateScroll]);

	const renderContent = () => {
		if (!message.streaming || message.metaDataStarted) {
			return <Markdown content={message.content} />;
		}

		function highlightLastWord(str) {
			if (!str || typeof str !== 'string') return { base: '', lastWord: '...' };

			// Return the full content as base without any modification
			return { base: str, lastWord: '...' };
		}

		const { base, lastWord } = highlightLastWord(message.content);

		return (
			<>
				<div className="message__data">
					{!message.content && (message.streaming || message.transcribing) ? (
						<div className="message__data__loading">
							<div className="loader" />
						</div>
					) : (
						<>
							{base && <Markdown content={base} inline />}
							<span className="streaming-content">{lastWord}</span>
						</>
					)}
				</div>
			</>
		);
	};

	return <>{renderContent()}</>;
}
