import React, { useState } from 'react';

import { Button } from 'pragmate-ui/components';

import { Player } from './player';
import { useInputContext } from '../context';
import { PermissionsModal } from './modal';
import { PermissionsErrorModal } from './error-modal';
export /*bundle*/ const RecordingButton = ({ disabled = false }) => {
	const { recorder, recording, setRecording } = useInputContext();
	const [fetching, setFetching] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState(false);
	const [, setHasPermission] = useState(globalThis?.localStorage.getItem('aimpact.recording.permission'));

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
			const permissions = await recorder.hasPermissions();

			if (!permissions) {
				setShowModal(true);
				return;
			}

			onRecord();
		} catch (e) {
			setError(true);
		} finally {
			setFetching(false);
		}
	};

	const onClose = event => {
		setFetching(false);
		setShowModal(false);
	};
	const onCloseError = () => setError(false);
	const isDisabled = disabled || fetching;
	if (recording) return <Player />;

	return (
		<>
			<Button icon="mic" fetching={fetching} onClick={playAction} disabled={isDisabled} />
			<PermissionsModal show={showModal} onClose={onClose} onConfirm={getUserMedia} />
			<PermissionsErrorModal show={error} onClose={onCloseError} />
		</>
	);
};
