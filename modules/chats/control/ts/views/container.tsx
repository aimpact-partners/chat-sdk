import React from 'react';
import { useManager } from './use-manager';
import { ChatContext } from './context';
import { StoreManager } from '../store';
import { IAgentsContainerProps } from './types';
import { RealtimePanel } from './realtime/container';
export /*bundle */ function AgentsChatContainer({
	children,
	icon,
	autoplay,
	skeleton,
	empty,
	player,

	...props
}: Partial<IAgentsContainerProps>) {
	const [scrollPosition, setScrollPosition] = React.useState('top');
	const [showRealtime, setShowRealtime] = React.useState(false);
	const { ready, store } = useManager(props.id, props.realtime);
	const obj = store ? store : ({} as StoreManager);

	const SkeletonControl = skeleton;
	if (!ready && skeleton) return <SkeletonControl />;
	if (!ready) return null;
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
		recorder: store?.audioManager?.recorder,
		autoplay,
		systemIcon: icon,
		empty,
		realtime: props.realtime,
		setShowRealtime,
		skeleton,
		messages,
		player,
		attributes: props.attributes
	};

	return (
		<ChatContext.Provider value={contextValue}>
			{children}
			<RealtimePanel isVisible={showRealtime} />
		</ChatContext.Provider>
	);
}
