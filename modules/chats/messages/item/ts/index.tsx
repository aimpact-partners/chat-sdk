import * as React from 'react';
import { Markdown } from '@aimpact/chat-sdk/widgets/markdown';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
// Confi

export /*bundle*/
function Message({ message }: { message: any }) {
	const [content, setContent] = React.useState(message.content ?? '');
	const [streaming, setStreaming] = React.useState(!!message?.streaming);
	useBinder([message], () => {
		setContent(message.content ?? '');
		setStreaming(!!message?.streaming);
	});

	return (
		<>
			<div className="message__content">
				<Markdown content={content} />
				{streaming && (
					<div>
						<div className="loader" />
					</div>
				)}
			</div>
		</>
	);
}
