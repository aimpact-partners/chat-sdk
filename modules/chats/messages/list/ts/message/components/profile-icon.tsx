import React, { useState } from 'react';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { Image } from 'pragmate-ui/image';
import { useChatMessagesContext } from '../../context';

export function ProfileIcon({ role }) {
	const [loadError, setLoadError] = useState(false);
	const { systemIcon } = useChatMessagesContext();
	// the local storage is used to store the user's default profile icon while is defined a better way to handle this.
	const icon = role === 'user' ? 'user' : globalThis.localStorage.getItem('chat.app.user.default.profile');
	const userProps = sessionWrapper.user.getProperties();
	const handleLoadError = () => setLoadError(true);
	const src = role === 'user' ? userProps.photoURL : systemIcon;

	return (
		<picture className="picture__container">
			{(userProps.photoURL && !loadError) || role !== 'user' ? (
				<Image alt="agent" src={src} onError={handleLoadError} />
			) : (
				<Image alt="user image profile" src={systemIcon} onError={handleLoadError} />
			)}
		</picture>
	);
}
