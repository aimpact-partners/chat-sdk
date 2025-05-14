import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useChatContext } from '../context';
import { Messages } from '@aimpact/chat-sdk/messages';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { getChatContainerClass } from '../utils/get-chat-container-class';
import { EmptyState } from '../components/empty-state';
import { ErrorsRenderer } from '../components/errors-renderer';

export /*bundle*/ function Chat(): JSX.Element {
	const [isReader] = useState(false);
	const separatorRef = useRef<HTMLDivElement>(null);
	const { store, texts, systemIcon, empty, showAvatar } = useChatContext();
	const { messages } = store;
	const [, setMessagesCount] = useState<number>(messages?.length ?? 0);
	const [updateScroll, setUpdateScroll] = useState<number>(performance.now());
	const containerClass = getChatContainerClass(isReader);

	// Helper to scroll to the separator
	const scrollToSeparator = useCallback(() => {
		setTimeout(() => separatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
	}, []);

	// Handler for new messages
	const handleNewMessage = useCallback(() => {
		setMessagesCount(store.messages.length);
		scrollToSeparator();
	}, [store.messages.length, scrollToSeparator]);

	// Scroll to bottom on updateScroll change
	useEffect(() => scrollToSeparator(), [updateScroll, scrollToSeparator]);
	// Bind to store events
	useBinder([store.chat], handleNewMessage, ['new.message', 'response.finished']);

	// Early return for empty state
	if (!store.messages.length) {
		return (
			<div className={containerClass}>
				<EmptyState empty={empty} />
			</div>
		);
	}

	return (
		<div className={containerClass}>
			<section className="chat__content">
				<Messages
					chat={store.chat}
					showAvatar={showAvatar}
					setUpdateScroll={setUpdateScroll}
					player={store.audioManager.player}
					current={store.currentMessage}
					systemIcon={systemIcon}
					messages={store?.messages ?? []}
					texts={texts}
				/>

				<div ref={separatorRef} className="separator" />
			</section>
		</div>
	);
}
