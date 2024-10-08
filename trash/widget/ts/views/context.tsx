import React from 'react';
import type { StoreManager } from '../store';
//@ts-ignore
import type { Voice, VoiceLab } from '@aimpact/chat-sdk/voice';
interface IChatContext {
	messages?: any[];
	store: StoreManager;
	autoplay?: boolean;
	player: Voice | VoiceLab;
	texts: any;
	attributes: Map<string, any>;
	setScrollPosition: (position: string) => void;
	scrollPosition: string;
	systemIcon: string;
	ready: boolean;
}
export /*bundle */ const ChatContext = React.createContext({} as IChatContext);
export /*bundle */ const useChatContext = () => React.useContext(ChatContext);
