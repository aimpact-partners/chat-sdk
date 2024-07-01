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

export /*bundle*/ function Chat(props): JSX.Element {
	const { store } = useChatContext();

	const chatIntro = store.extensions.get('chat-intro');
	const [reader] = React.useState(false);
	const separator = React.useRef(null);

	let cls = `chat-control__container${reader ? ' reader__container' : ''}`;

	return (
		<div className={cls}>
			<Content separator={separator} />
			<div className='footer-container'>
				<BackArrow store={store} separator={separator} />
				{!chatIntro?.metadata?.avoidChat && <ChatInput store={store} isWaiting={false} />}
			</div>
		</div>
	);
}
