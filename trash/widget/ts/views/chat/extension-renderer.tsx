import React from 'react';
// import { extensions } from '@aimpact/chat/extensions';
import { useChatContext } from '../context';

export function ExtensionRenderer({ component, reference }) {
	const {
		store: { chat, extensions },
	} = useChatContext();

	const Component = component;
	if (!component) return null;
	return (
		<>
			<Component ref={reference} metadata={JSON.stringify(chat.metadata)} />
		</>
	);
}
