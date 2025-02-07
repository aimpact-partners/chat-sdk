import React from 'react';
import { useChatContext } from '../context';

export function RealtimeStatus() {
	const { store } = useChatContext();
	const { status } = store.realtime.client;

	const getStatusMessage = () => {
		const messages: Record<string, string> = {
			closed: 'Ready to call',
			connecting: 'Calling.',
			open: 'Calling...',
			closing: 'Hanging up',
			created: `${Math.floor(store.realtime.duration / 60)}:${(store.realtime.duration % 60)
				.toString()
				.padStart(2, '0')}`
		};
		return messages[status] || '';
	};

	return (
		<div className="realtime__status">
			<span>{getStatusMessage()}</span>
		</div>
	);
}
