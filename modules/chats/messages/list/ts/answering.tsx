import React from 'react';
import { Icon } from 'pragmate-ui/icons';
import { ICONS } from '@aimpact/chat-sdk/components/icons';

export const SystemAnswering = () => {
	return (
		<div className="message answering">
			<Icon className="lg" icon={ICONS['ai-profile']} />
			<div className="">
				<span className="dot"></span>
				<span className="dot"></span>
				<span className="dot"></span>
			</div>
		</div>
	);
};
