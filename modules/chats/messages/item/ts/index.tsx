import * as React from 'react';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';
import { useStore } from '@aimpact/chat-sdk/shared/hooks';
export /*bundle*/ function Message({ message, setUpdateScroll }: { message: any; setUpdateScroll: any }) {
	useStore(message, ['streaming', 'change']);
	React.useEffect(() => setUpdateScroll(performance.now()), [message.content, setUpdateScroll]);

	const renderContent = () => {
		if (!message.content) return null;

		if (!message.streaming) {
			return <Markdown content={message.content} />;
		}

		return (
			<>
				<div className="message__data">
					{!message.content && message.streaming ? (
						<div className="message__data__loading">
							<div className="loader" />
						</div>
					) : (
						<Markdown content={message.content} />
					)}
				</div>
				{/* <div className="loader" /> */}
			</>
		);
	};

	return <div className="message__content">{renderContent()}</div>;
}
