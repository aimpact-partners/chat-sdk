import React from 'react';
import { Chat } from './chat';
import { useChatContext } from './context';
import { ChatSkeleton } from './chat/skeleton';
import { ChatNotFound } from './not-found';

/**
 * Main component of the chat web component
 * @param param0 =
 * @returns
 */
export /*bundle*/ function AgentsChatPanel() {
	const { ready, store } = useChatContext();

	if (store.notFound && ready) return <ChatNotFound />;

	if (!ready) return <ChatSkeleton />;

	return <Chat />;
}
