import * as React from 'react';
import type { Editor } from '@tiptap/react';
import type { IStyleOption } from './types';
import { StyleOption } from './style-option';

interface ITextStyleSelectorProps {
	editor: Editor;
}

export const TextStyleSelector = ({ editor }: ITextStyleSelectorProps): JSX.Element => {
	if (!editor) return null;

	const [isOpen, setIsOpen] = React.useState(false);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	// Simplified style options configuration
	const styleOptions: IStyleOption[] = [
		{
			label: 'Normal text',
			style: 'Normal text',
			className: 'wiki-editor__style-normal',
			shortcut: 'Ctrl+Alt+0',
			command: (editor: any) => editor.chain().focus().setParagraph().run(),
		},
		// Generate heading options dynamically
		...Array.from({ length: 6 }, (_, i) => ({
			label: `Heading ${i + 1}`,
			style: `Heading ${i + 1}`,
			className: 'wiki-editor__style-heading',
			shortcut: `Ctrl+Alt+${i + 1}`,
			command: (editor: any) =>
				editor
					.chain()
					.focus()
					.toggleHeading({ level: i + 1 })
					.run(),
		})),
	];

	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen]);

	const getCurrentStyle = (): string => {
		// Check for headings first
		for (let i = 1; i <= 6; i++) {
			if (editor.isActive('heading', { level: i })) {
				return `Heading ${i}`;
			}
		}
		return 'Normal text';
	};

	// Extracted function to avoid inline definition
	const toggleDropdown = React.useCallback(
		(event: React.MouseEvent): void => {
			event.preventDefault();
			event.stopPropagation();
			setIsOpen(!isOpen);
		},
		[isOpen],
	);

	const closeDropdown = React.useCallback((): void => {
		setIsOpen(false);
	}, []);

	return (
		<div className='wiki-editor__text-style-selector' ref={dropdownRef}>
			<button
				className='wiki-editor__style-button'
				onClick={toggleDropdown}
				title='Estilos de texto'
				type='button'
			>
				<span>{getCurrentStyle()}</span>
				<svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
					<polyline points='6,9 12,15 18,9'></polyline>
				</svg>
			</button>

			{isOpen && (
				<div className='wiki-editor__style-dropdown'>
					{styleOptions.map(option => (
						<StyleOption key={option.style} option={option} editor={editor} onClose={closeDropdown} />
					))}
				</div>
			)}
		</div>
	);
};
