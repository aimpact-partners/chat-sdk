import React from 'react';
import { Form } from 'pragmate-ui/form';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { InputContext } from './context';
import type { StoreManager } from '../../store';
import { TextInput } from './text-input';
import { InputActionButton } from './action-button';
import { useChatContext } from '../context';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';

export /*bundle*/ const AgentsChatInput = ({ isWaiting = false }: { store: StoreManager; isWaiting: boolean }) => {
	const [recording, setRecording] = React.useState<boolean>(false);
	const [fetching, setFetching] = React.useState<boolean>(false);
	const [waiting, setWaiting] = React.useState<boolean>(false);
	const [text, setText] = React.useState('');

	const { store } = useChatContext();
	console.log(30, store);
	const recorder = {};

	useBinder([store], () => setWaiting(store.waitingResponse));

	const disabled = { disabled: false };
	const sendAudio = async event => {
		// 	setFetching(true);
		// 	event.preventDefault();
		// 	event.stopPropagation();
		// 	const audio = await recorder.stop();
		// 	store.sendMessage(audio);
		// 	setRecording(!recording);
		// 	setFetching(false);
	};

	const handleSend = async () => {
		try {
			setText('');
			setFetching(true);
			await store.sendMessage(text);

			setFetching(false);
		} catch (e) {
			console.error('error', e);
		}
	};
	const onSubmit = !!text.length ? handleSend : sendAudio;

	if (['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length) disabled.disabled = true;

	const isFetching = fetching || recording || waiting || isWaiting;
	let cls = `chat-input-container ${isFetching ? 'is-fetching' : ''}`;
	if (store.disabled) cls += 'is-disabled';
	// Defines the "system" that the chat will use

	const contextValue = { store, onSubmit, recorder, fetching, setRecording, recording, disabled: store.disabled };
	const buttonIsDisabled = disabled.disabled || store.waitingResponse || recording;

	return (
		<InputContext.Provider value={contextValue}>
			<Form onSubmit={onSubmit} className="chat-input-form">
				<div className={cls}>
					<div>
						<AppIconButton className="chat-input__icon" icon="attachFile" />
					</div>
					<TextInput
						text={text}
						disabled={store.disabled}
						setFetching={setFetching}
						fetching={isFetching}
						setText={setText}
						handleSend={handleSend}
					/>
					<InputActionButton text={text} onSend={handleSend} buttonIsDisabled={buttonIsDisabled} />
				</div>
			</Form>
		</InputContext.Provider>
	);
};
