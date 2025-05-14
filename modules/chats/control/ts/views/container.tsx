import React from 'react';
import { useManager } from './use-manager';
import { ChatContext } from './context';
import { StoreManager } from '../store';
import { IAgentsContainerProps } from './types';
import { RealtimePanel } from './realtime/container';

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
