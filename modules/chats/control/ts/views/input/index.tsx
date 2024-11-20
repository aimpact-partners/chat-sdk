import React from 'react';
import { Form } from 'pragmate-ui/form';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { InputContext } from './context';
import { TextInput } from './text-input';
import { InputActionButton } from './action-button';
import { useChatContext } from '../context';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';
import { IAgentsInputProps } from './types/agents-input';
import { useInputForm } from './hooks/use-input-form';

export /*bundle*/ const AgentsChatInput = ({
	isWaiting = false,
	autoTranscribe = false,
	disabled = false,
	onClick
}: Partial<IAgentsInputProps>) => {
	const [waiting, setWaiting] = React.useState<boolean>(false);

	const { store, recorder } = useChatContext();
	const { text, setText, onSubmit, fetching, recording, setRecording, setFetching } = useInputForm();

	useBinder([store], () => {
		console.log(2);
		setWaiting(store.waitingResponse);
	});

	const isFetching = fetching || waiting || isWaiting;

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

	const attrs = { disabled: disabled || store.disabled };
	const buttonIsDisabled = attrs.disabled || store.waitingResponse || recording;
	let cls = `chat-input-container ${isFetching ? 'is-fetching' : ''} ${isDisabled ? 'is-disabled' : ''}`;
	const containerAttrs = {
		className: cls
	};
	const controlAttrs = {
		onClick,
		className: `chat-input-form ${isDisabled ? 'is-disabled' : ''}`
	};

	if (['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length) attrs.disabled = true;

	return (
		<InputContext.Provider value={contextValue}>
			<Form onSubmit={onSubmit} {...controlAttrs}>
				<div {...containerAttrs}>
					<div>
						<AppIconButton disabled className="chat-input__icon" icon="attachFile" />
					</div>
					<TextInput
						text={text}
						setFetching={setFetching}
						fetching={isFetching}
						setText={setText}
						handleSend={onSubmit}
						disabled={isDisabled}
					/>

					<InputActionButton buttonIsDisabled={buttonIsDisabled} />
				</div>
			</Form>
		</InputContext.Provider>
	);
};
