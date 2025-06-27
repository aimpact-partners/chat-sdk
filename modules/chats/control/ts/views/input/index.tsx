import { Form } from 'pragmate-ui/form';
import { IconButton } from 'pragmate-ui/icons';
import React from 'react';
import { useChatContext } from '../context';
import { useStore } from '../hooks/use-store';
import { InputActionButton } from './action-button';
import { InputContext } from './context';
import { useInputForm } from './hooks/use-input-form';
import { TextInput } from './text-input';
import { IAgentsInputProps } from './types/agents-input';

export /*bundle*/ const AgentsChatInput = ({
	isWaiting = false,
	autoTranscribe = false,
	disabled = false,
	onClick
}: Partial<IAgentsInputProps>) => {
	const { store, recorder, setShowRealtime, realtime } = useChatContext();
	const { text, setText, onSubmit, fetching, recording, setRecording, setFetching } = useInputForm();
	const isFetching = fetching || isWaiting;
	const isDisabled = store.disabled || disabled;
	const contextValue = {
		store,
		onSubmit,
		recorder,
		autoTranscribe,
		fetching,
		setText,
		setRecording,
		recording,
		text,
		setFetching,
		disabled: isDisabled
	};
	useStore(store);

	const attrs = { disabled: disabled || store.disabled };
	const buttonIsDisabled = isDisabled || attrs.disabled || recording || isFetching;
	let cls = `chat-input-container ${isFetching ? 'is-fetching' : ''} ${isDisabled ? 'is-disabled' : ''}`;
	const containerAttrs = {
		className: cls
	};
	const controlAttrs = {
		onClick,
		className: `chat-input-form ${isDisabled ? 'is-disabled' : ''}`
	};

	if (['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length) attrs.disabled = true;

	const onClickSpeech = () => {
		setShowRealtime(true);
		store.realtime.call();
	};

	return (
		<InputContext.Provider value={contextValue}>
			<Form onSubmit={onSubmit} {...controlAttrs}>
				<div {...containerAttrs}>
					{/* <div>
						<AppIconButton disabled className="chat-input__icon" icon="attachFile" />
					</div> */}
					<TextInput
						text={text}
						setFetching={setFetching}
						fetching={isFetching}
						setText={setText}
						handleSend={onSubmit}
						disabled={isDisabled}
					/>
					<div className="input-chat__actions">
						{realtime && <IconButton icon="speech" onClick={onClickSpeech} />}
						<InputActionButton buttonIsDisabled={buttonIsDisabled || isDisabled} />
					</div>
				</div>
			</Form>
		</InputContext.Provider>
	);
};
