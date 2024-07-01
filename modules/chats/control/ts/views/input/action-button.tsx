import React from 'react';
import { RecordingButton } from './recording';
import { Button } from 'pragmate-ui/components';

export function InputActionButton({ text, store, onSend, buttonIsDisabled }) {
	return (
		<span className={`input__icon  input__icon--right`}>
			{!!text.length ? (
				<Button icon="send-arrow" onClick={onSend} disabled={buttonIsDisabled} />
			) : (
				<RecordingButton store={store} disabled={buttonIsDisabled} />
			)}
		</span>
	);
}
