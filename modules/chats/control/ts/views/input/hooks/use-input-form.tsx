import React from 'react';
import { useChatContext } from '../../context';
export function useInputForm() {
	const { store, recorder } = useChatContext();
	const [recording, setRecording] = React.useState<boolean>(false);
	const [fetching, setFetching] = React.useState<boolean>(false);
	const [text, setText] = React.useState('');
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
			await store.sendMessage(text);

			setFetching(false);
		} catch (e) {
			console.error('error', e);
		}
	};

	const onSubmit = !!text.length ? handleSend : sendAudio;

	return { recording, text, setText, setFetching, setRecording, fetching, onSubmit };
}
