import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { Button } from 'pragmate-ui/components';
import { Icon } from 'pragmate-ui/icons';
import { PreloadScreen } from '@aimpact/chat/shared/components';
import { EmptyView } from './empty-view';
import { ICONS } from '@aimpact/chat-sdk/components/icons';
import { sessionWrapper } from '@aimpact/chat-sdk/session';
import { routing } from '@beyond-js/kernel/routing';
import { useTexts } from '@aimpact/chat/shared/hooks';
import { module } from 'beyond_context';

export /*bundle*/
function View({ store }) {
	const [ready, setReady] = React.useState(store.ready);
	const [isFetching, setFetching] = React.useState(false);
	const [error, setError] = React.useState(false);
	const [textsReady, texts] = useTexts(module.specifier);

	useBinder([store], () => setReady(store.ready));
	if (!ready || !textsReady) return <PreloadScreen />;

	// TODO [reactive-0.0.1] @ftovar8 @jircdev model.found siempre viene undefined
	// if (!store.model.found) return <EmptyView />;
	if (!store.found) return <EmptyView />;
	const { model } = store;
	const handleClick = async () => {
		try {
			const response = await store.createChat(model.id, model.path);
			await store.saveSharedFolder(model.id, model.path);

			if (!response.status) {
				console.error(response.message);
				return;
			}
			const { id: chatId } = response.chat;
			routing.pushState(`/chat/${chatId}`);
		} catch (e) {
			console.error(e.message);
		}
	};

	const googleLogin = async event => {
		try {
			setFetching(true);
			const response = await sessionWrapper.signInWithGoogle();
			if (!response.status) {
				const { error } = response;
				if (error === 'POPUP_CLOSED_BY_USER') {
					setFetching(false);
				} else {
					setError('Error trying to login with Google');
				}
				return;
			}
			handleClick();
		} catch (e) {
			console.error(e.message);
		}
	};

	return (
		<div className="access__folder">
			<img alt="Shared folder" src="/assets/shared-folder.png" />
			<span className="access-details">
				<Icon icon={ICONS['aip-chat-logo']} className="acccess__ailogo" />
				<h1>{texts.welcome}</h1>
				<p>
					<strong>Knowledge Box {model.path.toUpperCase()} has been shared with you.</strong>
					<br />
					{texts.save}
				</p>

				{!sessionWrapper.logged ? (
					<Button icon="google" onClick={googleLogin} loading={isFetching} label="Google Sign In" />
				) : (
					<Button variant="primary" onClick={handleClick} icon="save">
						{texts.action}
					</Button>
				)}
			</span>
		</div>
	);
}
