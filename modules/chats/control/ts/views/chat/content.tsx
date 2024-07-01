import React from 'react';
import { useExtension } from './use-extension';
import { Messages } from '@aimpact/chat-sdk/messages';
import { useChatContext } from '../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { ExtensionRenderer } from './extension-renderer';

export function Content({ separator }) {
	const { store, texts, attributes } = useChatContext();
	const { messages } = store;
	const [totalMessages, setMessages] = React.useState<number>(messages?.length ?? [].length);
	const [ref, ready, webComponentName] = useExtension('chat-intro');

	useBinder(
		[store],
		() => {
			setMessages(store.messages.length);
		},
		'new.message'
	);

	let cls = `chat__content`;
	if (attributes.has('container')) cls += ` container--${attributes.get('container')}`;
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
						messages={store?.messages ?? []}
						texts={texts}
					/>
					<div ref={separator} className="separator" />
				</>
			)}
		</div>
	);
}
