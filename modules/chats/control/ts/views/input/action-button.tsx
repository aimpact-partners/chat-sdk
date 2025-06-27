import React from 'react';
import { RecordingButton } from './recording';
import { Button } from 'pragmate-ui/components';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';
import { useInputContext } from './context';
import { useStore } from '@aimpact/chat-sdk/shared/hooks';
import { Spinner } from 'pragmate-ui/components';
export function InputActionButton({ buttonIsDisabled }) {
	const { store, onSubmit, text } = useInputContext();

	useStore(store.chat, ['response.finished', 'metadata.started']);
	console.log(200, buttonIsDisabled);
	if (buttonIsDisabled) {
		return (
			<span className="input__icon  input__icon--right">
				<Spinner active />
			</span>
		);
	}
	if (!!text.length) {
		return (
			<span className="input__icon  input__icon--right">
				<AppIconButton
					icon="arrowUpward"
					className="circle"
					variant="primary"
					onClick={onSubmit}
					disabled={buttonIsDisabled}
				/>
			</span>
		);
	}

	return (
		<span className="input__icon  input__icon--right">
			<RecordingButton disabled={buttonIsDisabled} />
		</span>
	);
}
