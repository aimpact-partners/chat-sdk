import React from 'react';
import { UIManager } from '@aimpact/chat/ui/manager';
import { Button } from 'pragmate-ui/components';
import { Icon } from 'pragmate-ui/icons';
import { AppWrapper } from '@aimpact/chat-sdk/wrapper';
import { PreloadScreen } from '@aimpact/chat/shared/components';
import { ICONS } from '@aimpact/chat-sdk/components/icons';

export function ChatNotFound() {
	function openDialog() {
		UIManager.modalOpened = true;
	}

	if (!AppWrapper.ready) return <PreloadScreen />;
	return (
		<div className="not__found_chat ">
			<img src="/assets/not-found.png" alt="Chat not found" />
			<span className="not__found__details">
				<Icon icon={ICONS['aip-chat-logo']} className="not-found__ailogo" />
				<h2>Chat not found</h2>
				<p>
					<strong>We couldn't find a chat associated with that ID.</strong> <br />
					Please enter URL correctly or create a new chat.
				</p>
				<Button icon="chat" onClick={openDialog} label="Start New Chat" />
			</span>
		</div>
	);
}
