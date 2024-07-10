import React from 'react';
import { Form } from 'pragmate-ui/form';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { InputContext } from './context';
import type { StoreManager } from '../../store';
import { TextInput } from './text-input';
import { InputActionButton } from './action-button';
import { useChatContext } from '../context';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';
import { IAgentsInputProps } from './types/agents-input';
import { useInputForm } from './hooks/use-input-form';

export /*bundle*/ const AgentsChatInput = ({ isWaiting = false, autoTranscribe = false }: IAgentsInputProps) => {
	const [waiting, setWaiting] = React.useState<boolean>(false);
	const disabled = { disabled: false };
	const { store, recorder } = useChatContext();
	const { text, setText, onSubmit, fetching, recording, setRecording, setFetching } = useInputForm();

	useBinder([store], () => setWaiting(store.waitingResponse));

	if (['', undefined, null].includes(text.replaceAll('\n', '')) || !text.trim().length) disabled.disabled = true;

	const isFetching = fetching || recording || waiting || isWaiting;
	let cls = `chat-input-container ${isFetching ? 'is-fetching' : ''}`;

	if (store.disabled) cls += 'is-disabled';

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
		disabled: store.disabled
	};
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
						handleSend={onSubmit}
					/>

					<InputActionButton buttonIsDisabled={buttonIsDisabled} />
				</div>
			</Form>
		</InputContext.Provider>
	);
};
