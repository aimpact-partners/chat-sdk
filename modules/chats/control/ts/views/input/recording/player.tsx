import React from 'react';
import { IconButton } from 'pragmate-ui/icons';
import { Timer } from '../timer';
import { useInputContext } from '../context';

export const Player = () => {
	const { onSubmit, recorder, setRecording } = useInputContext();

	const cancel = async event => {
		event.preventDefault();
		await recorder.stop();
		setRecording(false);
	};
	return (
		<div className="recording-player__container">
			<IconButton className="circle" icon="delete" onClick={cancel} />
			<Timer action="start" />
			<IconButton icon="send" className="circle" variant="primary" onClick={onSubmit} />
		</div>
	);
};
