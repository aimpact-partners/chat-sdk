import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { Chat } from './chat';
import { ChatContext } from './context';
import { ChatSkeleton } from './chat/skeleton';
import { ChatNotFound } from './not-found';

export function View({ store, ...props }) {
	const [fetching, setFetching] = React.useState(store.fetching);
	const [ready, setReady] = React.useState(store.ready);
	const icon = props.attributes.get('icon');
	const [scrollPosition, setScrollPosition] = React.useState('top');
	const {
		autoplay,
		messages,
		texts,
		audioManager: { player }
	} = store;
	globalThis.store = store;
	useBinder([store], () => {
		setReady(store.ready);
	});

	const contextValue = {
		setScrollPosition: value => {
			if (!value) console.trace('setScrollPosition called with no value');
			setScrollPosition(value);
		},
		scrollPosition,
		store,
		texts: store.texts,
		autoplay,
		systemIcon: icon,
		messages,
		player,
		attributes: props.attributes
	};

	const Control = !store.notFound ? Chat : ChatNotFound;
	const View = ready ? Control : ChatSkeleton;

	return (
		<ChatContext.Provider value={contextValue}>
			<View />
		</ChatContext.Provider>
	);
}
