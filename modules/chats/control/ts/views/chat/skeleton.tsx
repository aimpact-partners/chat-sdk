import React from 'react';
import { useChatContext } from '../context';
import { ChatInput } from '../input';
import { CollapsibleHeader } from '@aimpact/chat/shared/components';
import { Preload } from 'pragmate-ui/preload';
import { Spinner } from 'pragmate-ui/components';
export function ChatSkeleton() {
	const { store } = useChatContext();
	return (
		<div className="chat-container">
			<Spinner active />
		</div>
	);
}
