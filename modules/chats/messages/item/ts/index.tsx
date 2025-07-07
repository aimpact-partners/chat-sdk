import { Message as MessageModel } from '@aimpact/chat-sdk/core';
import { useStore } from '@aimpact/chat-sdk/shared/hooks';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';
import * as React from 'react';

export /*bundle*/ function Message({
	message,
	setUpdateScroll,
	texts
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
			if (!str || typeof str !== 'string') return '<span class="streaming-content">...</span>';

			const words = str.trim().split(/\s+/);
			if (words.length === 0) return '<span class="streaming-content">...</span>';

			const lastWord = words.pop();
			const base = words.join(' ').trim();

			return `${base ? base + ' ' : ''}<span class="streaming-content">${lastWord}...</span>`;
		}

		return (
			<>
				<div className="message__data">
					{!message.content && (message.streaming || message.transcribing) ? (
						<div className="message__data__loading">
							<div className="loader" />
						</div>
					) : (
						<Markdown content={highlightLastWord(message.content)} />
					)}
				</div>
				{/* <div className="loader" /> */}
			</>
		);
	};

	return <div className="message__content">{renderContent()}</div>;
}
