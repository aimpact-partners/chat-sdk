import React from 'react';
import { RecordingButton } from './recording';
import { Button } from 'pragmate-ui/components';

import { useInputContext } from './context';

export function InputActionButton({ text, onSend, buttonIsDisabled }) {
	const { store } = useInputContext();

	return (
		<span className="input__icon  input__icon--right">
			{!!text.length ? (
				<Button icon="send-arrow" onClick={onSend} disabled={buttonIsDisabled} />
			) : (
				<RecordingButton store={store} />
			)}
		</span>
	);
}
