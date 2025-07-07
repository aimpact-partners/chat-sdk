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

	// Additional check for empty text
	const isTextEmpty = ['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length;
	const finalDisabled = isDisabled;

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
		disabled: finalDisabled
	};
	useStore(store);

	let cls = `chat-input-container ${isFetching ? 'is-fetching' : ''} ${finalDisabled ? 'is-disabled' : ''}`;
	const containerAttrs = {
		className: cls
	};
	const controlAttrs = {
		onClick,
		className: `chat-input-form ${finalDisabled ? 'is-disabled' : ''}`
	};

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
						disabled={finalDisabled}
					/>
					<div className="input-chat__actions">
						{realtime && <IconButton icon="speech" onClick={onClickSpeech} />}
						<InputActionButton buttonIsDisabled={finalDisabled} fetching={isFetching} />
					</div>
				</div>
			</Form>
		</InputContext.Provider>
	);
};
