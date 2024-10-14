import React, { useState } from 'react';
import { Image } from 'pragmate-ui/image';
import { useChatMessagesContext } from '../../context';

export function ProfileIcon({ role }) {
	const [loadError, setLoadError] = useState(false);
	const { systemIcon, chat } = useChatMessagesContext();
	const userProps = chat.user;
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
