import React from 'react';
import { RecordingButton } from './recording';
import { Button } from 'pragmate-ui/components';
import { AppIconButton } from '@aimpact/chat-sdk/components/icons';
import { useInputContext } from './context';

export function InputActionButton({ buttonIsDisabled }) {
	const { onSubmit, text } = useInputContext();

	if (!!text.length) {
		console.log('ahora renderizamos');
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
			<RecordingButton />
		</span>
	);
}
