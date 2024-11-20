import React from 'react';
import { IconButton } from 'pragmate-ui/icons';
import { Timer } from '../timer';
import { useInputContext } from '../context';
import { Spinner, Button } from 'pragmate-ui/components';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';

export const Player = () => {
	const { recorder, setRecording, autoTranscribe, store, setText, setFetching } = useInputContext();
	const [processing, setProcessing] = React.useState(false);
	const [disabled, setDisabled] = React.useState(true);

	const cancel = async event => {
		event.preventDefault();
		await recorder.stop();
		setRecording(false);
	};

	React.useEffect(() => {
		setTimeout(() => {
			setDisabled(false);
		}, 1000);
	}, []);
	const transcribe = async () => {
		setProcessing(true);
		const audio = await recorder.stop();
		const transcription = await store.transcribe(audio);
		if (transcription.error) {
			console.error(transcription.error);
			return;
		}
		setText(transcription.data.text);
		setRecording(false);
	};

	const onSubmit = async event => {
		event.preventDefault();
		event.stopPropagation();
		try {
			setFetching(true);
			if (autoTranscribe) return transcribe();
			const audio = await recorder.stop();
			console.log('audio', audio);
			store.sendAudio(audio);
			setRecording(false);
			setFetching(false);
		} catch (e) {
			console.error(e);
		}
	};
	return (
		<div className="recording-player__container">
			<IconButton className="circle" icon="delete" onClick={cancel} />
			<Timer action="start" />
			<div className="recording-button__container">
				{processing ? (
					<Button>
						<Spinner active />
					</Button>
				) : (
					<AppIconButton
						icon="arrowUpward"
						className="circle"
						variant="primary"
						onClick={onSubmit}
						disabled={disabled}
					/>
				)}
			</div>
		</div>
	);
};
