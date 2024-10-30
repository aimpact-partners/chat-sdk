import React from 'react';

import { useChatContext } from '../context';
import { Messages } from '@aimpact/chat-sdk/messages';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';

export /*bundle*/ function Chat(): JSX.Element {
	const [reader] = React.useState(false);
	const separator = React.useRef(null);
	const { store, texts, systemIcon, empty } = useChatContext();
	const { messages } = store;
	const [, setMessages] = React.useState<number>(messages?.length ?? [].length);
	let cls = `chat-control__container${reader ? ' reader__container' : ''}`;
	const onNewMessage = () => {
		setMessages(store.messages.length);

		globalThis.setTimeout(() => {
			separator.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 100);
		// globalThis.scrollTo(0, document.body.scrollHeight);
	};

	React.useEffect(() => {
		globalThis.setTimeout(() => {
			separator.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 100);
	}, []);
	useBinder([store.chat], onNewMessage, 'new.message');

	let clsContent = `chat__content`;

	if (!store.messages.length) {
		const Control = empty ? empty : <>No hay contenido</>;
		//@ts-ignore
		return <Control />;
	}

	return (
		<div className={cls}>
			<section className={clsContent}>
				<Messages
					chat={store.chat}
					player={store.audioManager.player}
					current={store.currentMessage}
					store={store}
					systemIcon={systemIcon}
					messages={store?.messages ?? []}
					texts={texts}
				/>
				<div ref={separator} className="separator" />
			</section>
		</div>
	);
}
