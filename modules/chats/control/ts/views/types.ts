import { Chat, Messages } from '@aimpact/chat-sdk/core';
import React from 'react';

export /*bundle*/ interface IAgentsContainerProps {
	id: string;
	children: React.ReactNode;
	icon: string;
	autoplay: boolean;
	language: string;
	empty: React.ComponentType;
	skeleton: React.ComponentType;
	player: any;
	model: Chat;
	onListenChat: (data: any) => void;
	showAvatar: boolean;

	attributes: any;
	realtime: boolean;
}
