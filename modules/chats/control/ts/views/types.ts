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
	attributes: any;
	realtime: boolean;
}
