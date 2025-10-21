import React from 'react';
import { StoreManager } from '../store';
import { ChatContext } from './context';
import { RealtimePanel } from './realtime/container';
import { IAgentsContainerProps } from './types';
import { useManager } from './use-manager';

export /*bundle */ function AgentsChatContainer({
	children,
	icon: systemIcon,
	autoplay,
	skeleton: SkeletonControl,
	language,
	empty,
	model,
	player,
	showAvatar = false,
	onListenChat,
	attributes,
	realtime,
	id,
	...rest
}: Partial<IAgentsContainerProps>) {
	const [scrollPosition, setScrollPosition] = React.useState('top');
	const [showRealtime, setShowRealtime] = React.useState(false);

	const { ready, store } = useManager({
		id,
		language,
		onListenChat,
		realtime,
		model
	});

	if (!ready) return SkeletonControl ? <SkeletonControl /> : null;

	const { messages, ready: storeReady, texts, audioManager } = store || ({} as StoreManager);

	const contextValue = {
		setScrollPosition: value => {
			if (!value) console.trace('setScrollPosition called with no value');
			setScrollPosition(value);
		},
		scrollPosition,
		store,
		ready: storeReady,
		texts,
		recorder: audioManager?.recorder,
		autoplay,
		systemIcon,
		empty,
		realtime,
		setShowRealtime,
		showAvatar,
		skeleton: SkeletonControl,
		messages,
		player,
		attributes,
		...rest
	};

	return (
		<ChatContext.Provider value={contextValue}>
			{children}
			<RealtimePanel isVisible={showRealtime} />
		</ChatContext.Provider>
	);
}
