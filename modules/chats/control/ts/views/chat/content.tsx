import React from 'react';
import { useExtension } from './use-extension';
import { Messages } from '@aimpact/chat-sdk/messages';
import { useChatContext } from '../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { ExtensionRenderer } from './extension-renderer';

export function Content({ separator }) {
	const { store, texts, systemIcon, empty } = useChatContext();
	const { messages } = store;
	const [, setMessages] = React.useState<number>(messages?.length ?? [].length);
	const [ref, ready, webComponentName] = useExtension('chat-intro');
	const onNewMessage = () => {
		setMessages(store.messages.length);
		globalThis.setTimeout(() => {
			separator.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 100);
		// globalThis.scrollTo(0, document.body.scrollHeight);
	};

	useBinder([store.chat], onNewMessage, 'new.message');

	let cls = `chat__content`;

	if (!store.messages.length) {
		const Control = empty ?? <>No hay contenido</>;
		return (
			<div className={cls}>
				<Control />
			</div>
		);
	}

	return (
		<div className={cls}>
			<ExtensionRenderer component={webComponentName} reference={ref} />
			{ready && (
				<>
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
				</>
			)}
		</div>
	);
}
