import React from 'react';
import { useManager } from './use-manager';
import { ChatContext } from './context';
import { StoreManager } from '../store';
export /*bundle */ function AgentsChatContainer({ children, icon, autoplay, player, ...props }) {
	const [scrollPosition, setScrollPosition] = React.useState('top');

	const { ready, store } = useManager(props.id);

	const obj = store ? store : ({} as StoreManager);
	const { messages, texts } = obj;
	const contextValue = {
		setScrollPosition: value => {
			if (!value) console.trace('setScrollPosition called with no value');
			setScrollPosition(value);
		},
		scrollPosition,
		store,
		ready: store.ready,
		texts: store.texts,
		autoplay,
		systemIcon: icon,
		messages,
		player,
		attributes: props.attributes
	};

	return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}
