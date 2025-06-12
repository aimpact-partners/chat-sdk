import React from 'react';
import { useChatContext } from '../../context';
import { useUploader } from '@aimpact/media-manager/uploader';
export function useInputForm() {
	const { store, recorder } = useChatContext();
	const [recording, setRecording] = React.useState<boolean>(false);
	const [fetching, setFetching] = React.useState<boolean>(false);

	const [text, setText] = React.useState('');
	const { triggerRef, dropZoneRef, publish, uploading, progress, errors, files } = useUploader({
		url: '/api/upload',
		name: 'userFiles',
		multiple: true
	});

	const sendAudio = async event => {
		setFetching(true);
		event.preventDefault();
		event.stopPropagation();
		const audio = await recorder.stop();

		store.sendAudio(audio);
		setRecording(!recording);
		setFetching(false);
	};

	const handleSend = async event => {
		try {
			event?.stopPropagation();
			setText('');
			setFetching(true);
			const file = files.map(item => item.file)[0];
			console.log(0.1, file);
			await store.sendMessage(text, file);

			setFetching(false);
		} catch (e) {
			console.error('error', e);
		} finally {
			setFetching(false);
		}
	};

	const onSubmit = !!text.length ? handleSend : sendAudio;

	return {
		triggerRef,
		dropZoneRef,
		files,
		recording,
		text,
		setText,
		setFetching,
		setRecording,

		fetching,
		onSubmit
	};
}
