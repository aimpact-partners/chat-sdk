import React from 'react';
import { Form } from 'pragmate-ui/form';

import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { InputContext } from './context';
import { SystemModal } from './system/index';
import type { StoreManager } from '../../store';
import { TextInput } from './text-input';
import { InputActionButton } from './action-button';

export /*bundle*/ const ChatInput = ({ store, isWaiting = false }: { store: StoreManager; isWaiting: boolean }) => {
	const [recording, setRecording] = React.useState<boolean>(false);
	const [fetching, setFetching] = React.useState<boolean>(false);
	const [waiting, setWaiting] = React.useState<boolean>(false);
	const [text, setText] = React.useState('');
	const {
		audioManager: { recorder }
	} = store;

	useBinder([store], () => setWaiting(store.waitingResponse));

	const disabled = { disabled: false };
	const sendAudio = async event => {
		setFetching(true);
		event.preventDefault();
		event.stopPropagation();
		const audio = await recorder.stop();

		store.sendMessage(audio);
		setRecording(!recording);
		setFetching(false);
	};

	const handleSend = async () => {
		try {
			setText('');
			setFetching(true);
			const response = await store.sendMessage(text);
			console.log(1, 'obtenida respuesta');
			setFetching(false);
		} catch (e) {
			console.error('error', e);
		}
	};
	const onSubmit = !!text.length ? handleSend : sendAudio;

	if (['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length) disabled.disabled = true;

	const isFetching = fetching || recording || waiting || isWaiting;
	let cls = `input-container ${isFetching ? 'is-fetching' : ''}`;
	if (store.disabled) cls += 'is-disabled';
	// Defines the "system" that the chat will use
	// const { system } = config.params.config;
	const contextValue = { store, onSubmit, recorder, setRecording, recording, disabled: store.disabled };
	const buttonIsDisabled = disabled.disabled || store.waitingResponse || recording;
	console.log(40, isFetching, fetching);
	// if (attributes.has('container')) cls += ` container--${attributes.get('container')}`;
	return (
		<div className={cls}>
			<InputContext.Provider value={contextValue}>
				{/* {system && <SystemModal chat={store.chat} />} */}
				<Form onSubmit={onSubmit} className="chat-input-form">
					<TextInput
						store={store}
						text={text}
						disabled={store.disabled}
						setFetching={setFetching}
						fetching={isFetching}
						setText={setText}
						handleSend={handleSend}
					/>
					<InputActionButton
						text={text}
						store={store}
						onSend={handleSend}
						buttonIsDisabled={buttonIsDisabled}
					/>
				</Form>
			</InputContext.Provider>
		</div>
	);
};
