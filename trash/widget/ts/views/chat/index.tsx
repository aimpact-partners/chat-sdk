import React from 'react';
import { useChatContext } from '../context';
import { ChatInput } from '../input';
import { BackArrow } from './back-arrow';
import { Content } from './content';
declare global {
	namespace JSX {
		interface IntrinsicElements {
			'class-intro': {};
		}
	}
}

export /*bundle*/ function Chat(): JSX.Element {
	const { store } = useChatContext();
	const [reader] = React.useState(false);
	const separator = React.useRef(null);

	let cls = `chat-control__container${reader ? ' reader__container' : ''}`;

	return (
		<div className={cls}>
			<Content separator={separator} />
			{/* <section className="botton-chat-section">
				<ChatInput store={store} isWaiting={false} />
			</section> */}
		</div>
	);
}
