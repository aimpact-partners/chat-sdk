import * as React from 'react';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';

export /*bundle*/ function Message({ message, setUpdateScroll }: { message: any; setUpdateScroll: any }) {
	const [content, setContent] = React.useState(message.content ?? '');
	const [streaming, setStreaming] = React.useState(!!message?.streaming);

	const previousContentRef = React.useRef<string>(message.content ?? '');

	React.useEffect(() => {
		const handleChange = () => {
			const newContent = message.content ?? '';
			previousContentRef.current = content;
			setContent(newContent);
			setStreaming(!!message?.streaming);
			setUpdateScroll(performance.now());
		};

		message.on('change', handleChange);
		return () => message.off('change', handleChange);
	}, [message, setUpdateScroll, content]);

	const renderContent = () => {
		if (!content) return null;

		if (!streaming) {
			return <Markdown content={content} />;
		}

		const previousContent = previousContentRef.current;
		const previousLength = previousContent.length;
		const newContent = content.slice(previousLength);

		// Inject span directly into Markdown string as raw HTML

		let combinedContent = `${previousContent}`;
		if (newContent !== '' && newContent !== ' ') {
			combinedContent = `${previousContent}<span class="streaming-content">${newContent}</span>`;
		}

		return (
			<>
				<div className="message__data">
					<Markdown content={combinedContent} />
				</div>
				{/* <div className="loader" /> */}
			</>
		);
	};

	return <div className="message__content">{renderContent()}</div>;
}
