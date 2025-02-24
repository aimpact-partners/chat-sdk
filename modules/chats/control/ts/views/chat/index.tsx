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
	const [updateScroll, setUpdateScroll] = React.useState(performance.now());
	let cls = `chat-control__container${reader ? 'chat-control__container  chat-control__container--reader' : ''}`;
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
	}, [updateScroll]);

	useBinder([store.chat], onNewMessage, ['new.message', 'response.finished']);

	let clsContent = `chat__content`;

	if (!store.messages.length) {
		const Control = empty ? empty : <>No hay contenido</>;
		//@ts-ignore
		return (
			<div className={cls}>
				{/*@ts-ignore*/}
				<Control />
			</div>
		);
	}

	return (
		<div className={cls}>
			<section className={clsContent}>
				<Messages
					chat={store.chat}
					setUpdateScroll={setUpdateScroll}
					player={store.audioManager.player}
					current={store.currentMessage}
					systemIcon={systemIcon}
					messages={store?.messages ?? []}
					texts={texts}
				/>
				<div ref={separator} className="separator" />
			</section>
		</div>
	);
}
