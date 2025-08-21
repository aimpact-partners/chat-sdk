import * as React from 'react';
import clsx from 'clsx';
import type { IButton } from './config';
import { generateButtonAction, generateButtonIsActive, generateButtonIcon } from './actions';
import { Button as PragmateButton } from 'pragmate-ui/components';

interface IButtonProps {
	button: IButton;
	editor: any; // TipTap Editor
}

// Custom hook to subscribe to editor changes
const useEditorSubscription = (editor: any) => {
	const [, forceUpdate] = React.useReducer(x => x + 1, 0);

	React.useEffect(() => {
		if (!editor) return;

		const updateListener = () => {
			forceUpdate();
		};

		// Listen to all relevant editor events
		editor.on('update', updateListener);
		editor.on('selectionUpdate', updateListener);
		editor.on('transaction', updateListener);
		editor.on('focus', updateListener);
		editor.on('blur', updateListener);

		return () => {
			editor.off('update', updateListener);
			editor.off('selectionUpdate', updateListener);
			editor.off('transaction', updateListener);
			editor.off('focus', updateListener);
			editor.off('blur', updateListener);
		};
	}, [editor]);

	return forceUpdate;
};

export const Button = ({ button, editor }: IButtonProps): JSX.Element => {
	// Automatically generate button properties
	const action = generateButtonAction(button);
	const isActive = generateButtonIsActive(button);
	const icon = generateButtonIcon(button);

	// Subscribe to editor changes
	useEditorSubscription(editor);

	// Get the active state
	const activeState = isActive(editor);

	return (
		<PragmateButton
			onClick={() => {
				action(editor);
			}}
			className={clsx('wiki-editor__button', {
				'is-active': activeState
			})}
			title={button.title}
		>
			{icon}
		</PragmateButton>
	);
};
