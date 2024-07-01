import React, { useState } from 'react';
import { Icon } from 'pragmate-ui/icons';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { ICONS } from '@aimpact/chat-sdk/components/icons';
import { Image } from 'pragmate-ui/image';

export function ProfileIcon({ role }) {
	const [loadError, setLoadError] = useState(false);
	// the local storage is used to store the user's default profile icon while is defined a better way to handle this.
	const icon = role === 'user' ? 'user' : globalThis.localStorage.getItem('chat.app.user.default.profile');
	const userProps = sessionWrapper.user.getProperties();
	const handleLoadError = () => setLoadError(true);
	const src = role === 'user' ? userProps.photoURL : globalThis.localStorage.getItem('chat.app.user.default.profile');
	return (
		<picture className="picture__container">
			{(userProps.photoURL && !loadError) || role !== 'user' ? (
				<Image alt="user image profile" src={src} onError={handleLoadError} />
			) : (
				<Icon className="lg" icon={ICONS[icon] ?? icon} />
			)}
		</picture>
	);
}
