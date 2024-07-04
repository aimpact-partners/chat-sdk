import React from 'react';
import { useChatContext } from '../context';
import { Spinner } from 'pragmate-ui/components';
export function ChatSkeleton() {
	const { store } = useChatContext();
	return (
		<div className="chat-container">
			<Spinner active />
		</div>
	);
}
