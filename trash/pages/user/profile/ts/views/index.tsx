import React from 'react';
import { useTexts, useBinder } from '@beyond-js/react-18-widgets/hooks';
import { module } from 'beyond_context';
import { Button } from 'pragmate-ui/components';

import { sessionWrapper } from '@aimpact/chat-sdk/session';
import ImagePicker from './profile-image/ImagePicker';
import { ProfileContext } from '../context';
import { LanguageSelector } from './language-selector/LanguageSelector';
import { ModeSelection } from './mode-selection';
import { AudioSettings } from './audio';

export /*bundle*/
function View({ store }) {
	const [textsReady, texts] = useTexts(module.specifier);
	const [ready, setReady] = React.useState(store.ready);
	const [fetching, setFetching] = React.useState(store.fetching);
	const [isUnpublished, setIsUnpublished] = React.useState(store.isUnpublished);
	const [accessibility, setAccessibilty] = React.useState(store.accessibility);

	useBinder([store], () => {
		setReady(store.ready);
		setFetching(store.fetching);
		setIsUnpublished(store.isUnpublished);
		setAccessibilty(store.dyslexia);
	});

	if (!textsReady || !ready) return null;
	const userProps = sessionWrapper.user.getProperties();
	const { displayName, email } = userProps;

	return (
		<>
			<ProfileContext.Provider value={{ store, texts }}>
				<aside className='profile-container'>
					<header>
						<figure>
							<ImagePicker userProps={userProps} />
						</figure>
						<h4 className='h3'>{displayName}</h4>
					</header>
					<section></section>

					<div className='profile__item'>
						<strong>Email</strong>
						<span>{email}</span>
					</div>

					<LanguageSelector />
					<ModeSelection />
					<AudioSettings />
					{store.isUnpublished && (
						<Button loading={fetching} onClick={store.save}>
							{texts.save}
						</Button>
					)}
				</aside>
			</ProfileContext.Provider>
		</>
	);
}
