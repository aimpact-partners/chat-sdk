import * as React from 'react';
import type { IStyleOptionProps } from './types';

export const StyleOption: React.FC<IStyleOptionProps> = ({ option, editor, onClose }) => {
	// Extracted event handlers to avoid inline functions
	const handleClick = React.useCallback(
		(event: React.MouseEvent): void => {
			event.preventDefault();
			event.stopPropagation();

			if (editor && option.command) {
				option.command(editor);
				onClose();
			}
		},
		[editor, option.command, onClose],
	);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent): void => {
			if (event.key === 'Enter') {
				event.preventDefault();
				handleClick(event as any);
			}
		},
		[handleClick],
	);

	return (
		<div
			className='wiki-editor__style-option'
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role='button'
			tabIndex={0}
			data-style={option.style}
		>
			<span className={option.className}>{option.label}</span>
			<kbd>{option.shortcut}</kbd>
		</div>
	);
};
