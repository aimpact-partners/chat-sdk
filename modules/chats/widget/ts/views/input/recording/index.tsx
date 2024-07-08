import React, { useState } from 'react';

import { Button } from 'pragmate-ui/components';

import { Player } from '../player';
import { useChatContext } from '../../context';
import { useInputContext } from '../context';
import { PermissionsModal } from './modal';
import { PermissionsErrorModal } from './error-modal';
export /*bundle*/ const RecordingButton = ({ store, store: { audioManager }, disabled }) => {
	const { recorder, recording, setRecording } = useInputContext();
	const [fetching, setFetching] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState(false);
	const [hasPermission, setHasPermission] = useState(
		globalThis?.localStorage.getItem('aimpact.recording.permission'),
	);
	const { texts } = useChatContext();
	const onRecord = async () => {
		try {
			await recorder.record();
			setRecording(!recording);
		} catch (e) {
			setError(true);
		}
	};

	const getUserMedia = () => {
		recorder
			.hasPermissions()
			.then(() => {
				globalThis?.localStorage.setItem('aimpact.recording.permission', 'true');
				setHasPermission('true');
			})
			.catch(error => {
				console.log('permisos no concedidos');
				setError(true);
			});
	};
	const playAction = async event => {
		try {
			event.preventDefault();
			setFetching(true);

			if (!hasPermission || hasPermission !== 'true') {
				setShowModal(true);
				return;
			}

			onRecord();
		} catch (e) {
			console.log(30);
			setError(true);
		} finally {
			setFetching(false);
		}
	};

	const onClose = event => {
		setFetching(false);
		setShowModal(false);
	};

	if (recording) return <Player />;

	return (
		<>
			<Button icon='mic' fetching={fetching} onClick={playAction} disabled={disabled || fetching} />
			<PermissionsModal show={showModal} onClose={onClose} onConfirm={getUserMedia} />
			<PermissionsErrorModal show={error} onClose={() => setError(false)} />
		</>
	);
};
