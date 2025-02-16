import React from 'react';
import type { StoreManager } from '../store';
//@ts-ignore
import type { Voice, VoiceLab } from '@aimpact/chat-sdk/voice';
import { Recorder } from '../store/recorder';

interface IChatContext {
	messages?: any[];
	store: StoreManager;
	autoplay?: boolean;
	recorder?: Recorder;
	player: Voice | VoiceLab;
	texts: any;
	attributes: Map<string, any>;
	setScrollPosition: (position: string) => void;
	setShowRealtime: (show: boolean) => void;
	showRealtime: boolean;
	scrollPosition: string;
	systemIcon: string;
	ready: boolean;
	realtime: boolean;
	skeleton: React.ElementType;
	empty: React.ElementType;
}
export /*bundle */ const ChatContext = React.createContext({} as Partial<IChatContext>);
export /*bundle */ const useChatContext = () => React.useContext(ChatContext);
