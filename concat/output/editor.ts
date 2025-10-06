/**
 * File: ts\menus\bubble.tsx
 */
import * as React from 'react';
import clsx from 'clsx';
import type { Editor } from '@tiptap/react';

interface IBubbleMenuProps {
	editor: Editor;
}

export const BubbleMenuContent = ({ editor }: IBubbleMenuProps): JSX.Element => {
	if (!editor) return null;

	return (
		<div className='wiki-editor__bubble-menu-content'>
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('bold'),
				})}
				title='Negrita'
			>
				<strong>B</strong>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('italic'),
				})}
				title='Cursiva'
			>
				<em>I</em>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('underline'),
				})}
				title='Subrayado'
			>
				<u>U</u>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('strike'),
				})}
				title='Tachado'
			>
				<s>S</s>
			</button>

			<button
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={clsx('wiki-editor__button', {
					'is-active': editor.isActive('code'),
				})}
				title='Código inline'
			>
				<code>{'<>'}</code>
			</button>
		</div>
	);
};

/**
 * File: ts\menus\floating.tsx
 */
import * as React from 'react';
import type { Editor } from '@tiptap/react';

interface IFloatingMenuProps {
	editor: Editor;
}

export const FloatingMenuContent = ({ editor }: IFloatingMenuProps): JSX.Element => {
	if (!editor) return null;

	const insertBlock = (type: string): void => {
		switch (type) {
			case 'heading1':
				editor.chain().focus().toggleHeading({ level: 1 }).run();
				break;
			case 'heading2':
				editor.chain().focus().toggleHeading({ level: 2 }).run();
				break;
			case 'heading3':
				editor.chain().focus().toggleHeading({ level: 3 }).run();
				break;
			case 'bulletList':
				editor.chain().focus().toggleBulletList().run();
				break;
			case 'orderedList':
				editor.chain().focus().toggleOrderedList().run();
				break;
			case 'taskList':
				editor.chain().focus().toggleTaskList().run();
				break;
			case 'blockquote':
				editor.chain().focus().toggleBlockquote().run();
				break;
			case 'codeBlock':
				editor.chain().focus().toggleCodeBlock().run();
				break;
			case 'horizontalRule':
				editor.chain().focus().setHorizontalRule().run();
				break;
		}
	};

	return (
		<div className='wiki-editor__floating-menu-content'>
			<div className='wiki-editor__floating-menu-section'>
				<h4>Encabezados</h4>
				<button onClick={() => insertBlock('heading1')} className='wiki-editor__floating-button'>
					H1
				</button>
				<button onClick={() => insertBlock('heading2')} className='wiki-editor__floating-button'>
					H2
				</button>
				<button onClick={() => insertBlock('heading3')} className='wiki-editor__floating-button'>
					H3
				</button>
			</div>

			<div className='wiki-editor__floating-menu-section'>
				<h4>Listas</h4>
				<button onClick={() => insertBlock('bulletList')} className='wiki-editor__floating-button'>
					Lista con viñetas
				</button>
				<button onClick={() => insertBlock('orderedList')} className='wiki-editor__floating-button'>
					Lista numerada
				</button>
				<button onClick={() => insertBlock('taskList')} className='wiki-editor__floating-button'>
					Lista de tareas
				</button>
			</div>

			<div className='wiki-editor__floating-menu-section'>
				<h4>Bloques</h4>
				<button onClick={() => insertBlock('blockquote')} className='wiki-editor__floating-button'>
					Cita
				</button>
				<button onClick={() => insertBlock('codeBlock')} className='wiki-editor__floating-button'>
					Bloque de código
				</button>
				<button onClick={() => insertBlock('horizontalRule')} className='wiki-editor__floating-button'>
					Línea horizontal
				</button>
			</div>
		</div>
	);
};

/**
 * File: ts\menus\index.ts
 */
export { BubbleMenuContent } from './bubble';
export { FloatingMenuContent } from './floating';

/**
 * File: ts\toolbar\actions.ts
 */
import type { Editor } from '@tiptap/react';
import type { IButton } from './config';

/**
 * Generates button action based on standard pattern
 */
export const generateButtonAction = (button: IButton): ((editor: Editor) => void) => {
	// If it already has a custom action, use it
	if (button.action) {
		return button.action;
	}

	// If it's a special case, handle it
	if (button.actionType === 'set') {
		return editor => {
			editor.chain().focus().setHorizontalRule().run();
		};
	}

	// Standard behavior: toggle + extension name
	const extensionName = button.extensionName || button.id;
	return editor => {
		const command = `toggle${extensionName.charAt(0).toUpperCase() + extensionName.slice(1)}`;

		if (typeof editor.chain === 'function' && editor.chain().focus()[command]) {
			editor.chain().focus()[command]().run();
		}
	};
};

/**
 * Generates button active state
 */
export const generateButtonIsActive = (button: IButton): ((editor: Editor) => boolean) => {
	// If it already has a custom state, use it
	if (button.isActive) {
		return button.isActive;
	}

	// Standard behavior: check if extension is active
	const extensionName = button.extensionName || button.id;
	return editor => editor.isActive(extensionName);
};

/**
 * Generates button icon
 */
export const generateButtonIcon = (button: IButton): string | JSX.Element => {
	// If it already has a custom icon, use it
	if (button.icon) {
		return button.icon;
	}

	// Standard behavior: use label
	return button.label;
};

/**
 * File: ts\toolbar\button.tsx
 */
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

/**
 * File: ts\toolbar\config.tsx
 */
import type { Editor } from '@tiptap/react';
import type { ReactElement } from 'react';
import * as React from 'react';
import {
	FontBoldIcon,
	FontItalicIcon,
	UnderlineIcon,
	StrikethroughIcon,
	TextIcon,
	ListBulletIcon,
	HamburgerMenuIcon,
	CheckboxIcon,
	QuoteIcon,
	CodeIcon,
	DividerHorizontalIcon,
	EraserIcon,
	ImageIcon
} from '@radix-ui/react-icons';

export interface IButton {
	id: string;
	label: string;
	title: string;
	group: 'text' | 'style-selector' | 'lists' | 'blocks' | 'formatting';
	// Optional properties for special cases
	icon?: string | JSX.Element;
	action?: (editor: Editor) => void;
	isActive?: (editor: Editor) => boolean;
	// For extensions that don't follow the standard pattern
	extensionName?: string;
	actionType?: 'toggle' | 'set' | 'custom';
	// Special property for components that render their own UI
	isComponent?: boolean;
	component?: string;
}

// Button configuration
export const BUTTONS: IButton[] = [
	// Text formatting - standard behavior (toggle + extension name)
	{
		id: 'bold',
		label: 'B',
		title: 'Bold',
		group: 'text',
		icon: <FontBoldIcon width={16} height={16} />
	},
	{
		id: 'italic',
		label: 'I',
		title: 'Italic',
		group: 'text',
		icon: <FontItalicIcon width={16} height={16} />
	},
	{
		id: 'underline',
		label: 'U',
		title: 'Underline',
		group: 'text',
		icon: <UnderlineIcon width={16} height={16} />
	},
	{
		id: 'strike',
		label: 'S',
		title: 'Strikethrough',
		group: 'text',
		icon: <StrikethroughIcon width={16} height={16} />
	},

	// Style selector - special component
	{
		id: 'text-style-selector',
		label: 'Styles',
		title: 'Text styles and headings',
		group: 'style-selector',
		isComponent: true,
		component: 'TextStyleSelector',
		icon: <TextIcon width={16} height={16} />
	},

	// Lists - standard behavior
	{
		id: 'bulletList',
		label: '• List',
		title: 'Bullet list',
		group: 'lists',
		icon: <ListBulletIcon width={16} height={16} />
	},
	{
		id: 'orderedList',
		label: '1. List',
		title: 'Ordered list',
		group: 'lists',
		icon: <HamburgerMenuIcon width={16} height={16} />
	},
	{
		id: 'taskList',
		label: '☐ Tasks',
		title: 'Task list',
		group: 'lists',
		icon: <CheckboxIcon width={16} height={16} />
	},

	// Blocks - standard behavior
	{
		id: 'blockquote',
		label: '" Quote',
		title: 'Quote',
		group: 'blocks',
		icon: <QuoteIcon width={16} height={16} />
	},
	{
		id: 'codeBlock',
		label: '<> Code',
		title: 'Code block',
		group: 'blocks',
		icon: <CodeIcon width={16} height={16} />
	},
	{
		id: 'horizontalRule',
		label: '—',
		title: 'Horizontal rule',
		group: 'blocks',
		// Special case: not toggle, is set
		actionType: 'set',
		icon: <DividerHorizontalIcon width={16} height={16} />
	},

	// Formatting - special actions
	{
		id: 'clearFormatting',
		label: 'Clear',
		title: 'Clear formatting',
		group: 'formatting',
		icon: <EraserIcon width={16} height={16} />,
		action: (editor: Editor) => {
			editor.chain().focus().clearNodes().unsetAllMarks().run();
		}
	},

	// Debug button to test active state
	{
		id: 'debug',
		label: 'Debug',
		title: 'Debug button to test active state',
		group: 'formatting',
		icon: <TextIcon width={16} height={16} />,
		isActive: (editor: Editor) => {
			// Test if bold is active
			return editor.isActive('bold');
		},
		action: (editor: Editor) => {
			// Toggle bold to test
			editor.chain().focus().toggleBold().run();
		}
	},
	{
		id: 'image',
		label: 'Image',
		title: 'Image',
		group: 'formatting',
		icon: <ImageIcon width={16} height={16} />,
		action: (editor: Editor) => {
			console.log('image');
			editor.chain().focus().setImage({ src: 'https://placehold.co/800x400' }).run();
		}
	}
];

export const GROUPS = {
	text: 'Text formatting',
	'style-selector': 'Text styles',
	lists: 'Lists',
	blocks: 'Blocks',
	formatting: 'Formatting'
} as const;

/**
 * File: ts\toolbar\editor-commands.ts
 */
import type { Editor } from '@tiptap/react';

// Editor command functions for each style
export const editorCommands = {
	'Normal text': (editor: Editor) => {
		editor.chain().focus().setParagraph().run();
	},
	'Heading 1': (editor: Editor) => {
		editor.chain().focus().toggleHeading({ level: 1 }).run();
	},
	'Heading 2': (editor: Editor) => {
		editor.chain().focus().toggleHeading({ level: 2 }).run();
	},
	'Heading 3': (editor: Editor) => {
		editor.chain().focus().toggleHeading({ level: 3 }).run();
	},
	'Heading 4': (editor: Editor) => {
		editor.chain().focus().toggleHeading({ level: 4 }).run();
	},
	'Heading 5': (editor: Editor) => {
		editor.chain().focus().toggleHeading({ level: 5 }).run();
	},
	'Heading 6': (editor: Editor) => {
		editor.chain().focus().toggleHeading({ level: 6 }).run();
	},
	'Quote': (editor: Editor) => {
		editor.chain().focus().toggleBlockquote().run();
	},
	'Clear formatting': (editor: Editor) => {
		editor.chain().focus().clearNodes().unsetAllMarks().run();
	},
} as const;

export type StyleCommand = keyof typeof editorCommands;

/**
 * File: ts\toolbar\section.tsx
 */
import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { Button } from './button';
import { TextStyleSelector } from './text-style-selector';
import { BUTTONS, GROUPS } from './config';

interface ISectionProps {
	editor: Editor;
	group: keyof typeof GROUPS;
}

export const Section = ({ editor, group }: ISectionProps): JSX.Element => {
	const buttons = BUTTONS.filter(button => button.group === group);

	if (buttons.length === 0) return null;

	return (
		<div className="wiki-editor__toolbar-section">
			{buttons.map(button => {
				// If it's a special component, render it directly
				if (button.isComponent && button.component === 'TextStyleSelector') {
					return <TextStyleSelector key={button.id} editor={editor} />;
				}

				// Otherwise render as a regular button
				return <Button key={button.id} button={button} editor={editor} />;
			})}
		</div>
	);
};

/**
 * File: ts\toolbar\style-option.tsx
 */
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

/**
 * File: ts\toolbar\text-style-selector.tsx
 */
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

/**
 * File: ts\toolbar\types.ts
 */
export interface IStyleOption {
	label: string;
	style: string;
	className: string;
	shortcut: string;
	command: (editor: any) => void; // Editor command function
}

export interface IStyleOptionProps {
	option: IStyleOption;
	editor: any; // TipTap Editor
	onClose: () => void; // Just notify parent to close dropdown
}

/**
 * File: ts\types\index.ts
 */
// WikiEditor Types
export interface IWikiEditorEvent {
	target: {
		name: string;
		value: string;
		type: string;
	};
	currentTarget: {
		name: string;
		value: string;
		type: string;
	};
}

export interface IWikiEditorProps {
	name?: string;
	onChange?: (event: IWikiEditorEvent) => void;
	initialContent?: string;
	placeholder?: string;
	className?: string;
	showToolbar?: boolean;
	outputFormat?: 'html' | 'markdown';
	markdownOptions?: IMarkdownOptions;
	markdownToHtmlOptions?: IMarkdownToHtmlOptions;
}

export interface IMarkdownOptions {
	headingStyle?: 'setext' | 'atx';
	codeBlockStyle?: 'indented' | 'fenced';
	bulletListMarker?: '-' | '+' | '*';
	emDelimiter?: '_' | '*';
	strongDelimiter?: '__' | '**';
	hr?: string;
}

export interface IMarkdownToHtmlOptions {
	gfm?: boolean; // GitHub Flavored Markdown
	breaks?: boolean; // Convertir saltos de línea a <br>
	headerIds?: boolean; // Agregar IDs a los headers
	mangle?: boolean; // Mangle email addresses
	headerPrefix?: string; // Prefijo para IDs de headers
}

// HTML to Markdown Types
export interface IHtmlToMarkdownOptions {
	headingStyle?: 'setext' | 'atx';
	codeBlockStyle?: 'indented' | 'fenced';
	bulletListMarker?: '-' | '+' | '*';
	emDelimiter?: '_' | '*';
	strongDelimiter?: '__' | '**';
	hr?: string;
}

/**
 * File: ts\utils\html-to-markdown.ts
 */
import TurndownService from 'turndown';

interface IHtmlToMarkdownOptions {
	headingStyle?: 'setext' | 'atx';
	codeBlockStyle?: 'indented' | 'fenced';
	bulletListMarker?: '-' | '+' | '*';
	emDelimiter?: '_' | '*';
	strongDelimiter?: '__' | '**';
	hr?: string;
}

export function htmlToMarkdown(html: string, options?: IHtmlToMarkdownOptions): string {
	const turndown = new TurndownService({
		headingStyle: options?.headingStyle || 'atx',
		codeBlockStyle: options?.codeBlockStyle || 'fenced',
		bulletListMarker: options?.bulletListMarker || '-',
		emDelimiter: options?.emDelimiter || '*',
		strongDelimiter: options?.strongDelimiter || '**',
		hr: options?.hr || '---',
	});

	// Remover elementos no deseados
	turndown.remove(['script', 'style']);

	// Agregar reglas personalizadas para mejor compatibilidad con Tiptap
	turndown.addRule('strikethrough', {
		filter: ['del', 's', 'strike'],
		replacement: function (content) {
			return '~~' + content + '~~';
		},
	});

	turndown.addRule('underline', {
		filter: ['u'],
		replacement: function (content) {
			return '<u>' + content + '</u>';
		},
	});

	turndown.addRule('taskList', {
		filter: function (node) {
			return node.type === 'checkbox' && node.parentNode?.nodeName === 'LI';
		},
		replacement: function (content, node) {
			const checked = (node as HTMLInputElement).checked;
			return checked ? '[x] ' : '[ ] ';
		},
	});

	return turndown.turndown(html);
}

/**
 * File: ts\utils\markdown-to-html.ts
 */
import { marked } from 'marked';

interface IMarkdownToHtmlOptions {
	// Opciones para la conversión de Markdown a HTML
	gfm?: boolean; // GitHub Flavored Markdown
	breaks?: boolean; // Convertir saltos de línea a <br>
	headerIds?: boolean; // Agregar IDs a los headers
	mangle?: boolean; // Mangle email addresses
	headerPrefix?: string; // Prefijo para IDs de headers
}

export function markdownToHtml(markdown: string, options?: IMarkdownToHtmlOptions): string {
	// Configurar marked con las opciones
	marked.setOptions({
		gfm: options?.gfm ?? true, // GitHub Flavored Markdown por defecto
		breaks: options?.breaks ?? false, // No convertir saltos de línea por defecto
		headerIds: options?.headerIds ?? true, // IDs en headers por defecto
		mangle: options?.mangle ?? false, // No manglear emails por defecto
		headerPrefix: options?.headerPrefix ?? 'wiki-editor-'
	});

	// Configurar renderizadores personalizados para mejor compatibilidad con TipTap
	const renderer = new marked.Renderer();

	// Renderizador personalizado para listas de tareas
	renderer.listitem = function (text, task, checked) {
		if (task !== undefined) {
			// Es una lista de tareas
			const checkbox = checked ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>';
			return `<li data-type="taskItem" data-checked="${checked}">${checkbox} ${text}</li>`;
		}
		// Lista normal
		return `<li>${text}</li>`;
	};

	// Renderizador personalizado para listas
	renderer.list = function (body, ordered) {
		const type = ordered ? 'ol' : 'ul';
		return `<${type}>${body}</${type}>`;
	};

	// Renderizador personalizado para código en línea
	renderer.codespan = function (code) {
		return `<code>${code}</code>`;
	};

	// Renderizador personalizado para bloques de código
	renderer.code = function (code, language) {
		if (language) {
			return `<pre><code class="language-${language}">${code}</code></pre>`;
		}
		return `<pre><code>${code}</code></pre>`;
	};

	// Renderizador personalizado para blockquotes
	renderer.blockquote = function (quote) {
		return `<blockquote>${quote}</blockquote>`;
	};

	// Renderizador personalizado para reglas horizontales
	renderer.hr = function () {
		return '<hr>';
	};

	// Aplicar el renderizador personalizado
	marked.use({ renderer });

	try {
		// Convertir Markdown a HTML
		const html = marked(markdown);
		return html;
	} catch (error) {
		console.error('Error converting markdown to HTML:', error);
		// En caso de error, devolver el markdown original envuelto en un párrafo
		return `<p>${markdown}</p>`;
	}
}

/**
 * File: ts\wiki-editor-ui.tsx
 */
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as React from 'react';
import { BubbleMenuContent, FloatingMenuContent } from './menus';

interface IWikiEditorUIProps {
	onChange?: (content: string) => void;
	initialContent?: string;
	placeholder?: string;
	className?: string;
}

export /*bundle*/ const WikiEditorUI = ({
	onChange,
	initialContent = '',
	placeholder = 'Escribe algo...',
	className = ''
}: IWikiEditorUIProps): JSX.Element => {
	const [showFloatingMenu, setShowFloatingMenu] = React.useState(false);
	const [floatingMenuPosition, setFloatingMenuPosition] = React.useState({ x: 0, y: 0 });
	const [showBubbleMenu, setShowBubbleMenu] = React.useState(false);
	const [bubbleMenuPosition, setBubbleMenuPosition] = React.useState({ x: 0, y: 0 });

	const editor = useEditor({
		extensions: [
			StarterKit,
			ListItem,
			BulletList,
			OrderedList,
			Underline,
			TaskList,
			TaskItem,
			Image,
			CodeBlock,
			Blockquote,
			HorizontalRule
		],
		content: initialContent,
		editorProps: {
			attributes: {
				class: `wiki-editor__content ${className}`,
				placeholder
			}
		},
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			onChange?.(html);
		},
		onSelectionUpdate: ({ editor }) => {
			const { selection } = editor.state;
			const { $from, $to } = selection;
			const hasSelection = $from.pos !== $to.pos;

			if (!hasSelection) {
				setShowFloatingMenu(false);
				setShowBubbleMenu(false);
				return;
			}

			// Show bubble menu for selected text
			const fromCoords = editor.view.coordsAtPos($from.pos);

			const centerX = fromCoords.left;
			setBubbleMenuPosition({
				x: centerX,
				y: fromCoords.top - 60
			});
			setShowBubbleMenu(true);
			setShowFloatingMenu(false);
		}
	});

	return (
		<div className="wiki-editor__wrapper">
			<EditorContent editor={editor} />

			{editor && showBubbleMenu && (
				<div
					className="wiki-editor__bubble-menu"
					style={{
						position: 'absolute',
						left: bubbleMenuPosition.x,
						top: bubbleMenuPosition.y,
						zIndex: 1000,
						transform: 'translateX(-50%)'
					}}
				>
					<BubbleMenuContent editor={editor} />
				</div>
			)}

			{editor && showFloatingMenu && (
				<div
					className="wiki-editor__floating-menu"
					style={{
						position: 'absolute',
						left: floatingMenuPosition.x,
						top: floatingMenuPosition.y,
						zIndex: 1000,
						transform: 'translateX(-50%)'
					}}
				>
					<FloatingMenuContent editor={editor} />
				</div>
			)}
		</div>
	);
};

/**
 * File: ts\wiki-editor.tsx
 */
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import clsx from 'clsx';
import * as React from 'react';
import { Section } from './toolbar';
import { htmlToMarkdown } from './utils/html-to-markdown';
import { markdownToHtml } from './utils/markdown-to-html';
import type { IWikiEditorProps } from './types';
import Image from '@tiptap/extension-image';

export /*bundle*/ const WikiEditor = ({
	name,
	onChange,
	initialContent = '',
	placeholder = 'Escribe algo...',
	className = '',
	showToolbar = true,
	outputFormat = 'markdown', // Por defecto Markdown como solicitaste
	markdownOptions,
	markdownToHtmlOptions
}: IWikiEditorProps): JSX.Element => {
	const [contentSet, setContentSet] = React.useState(false);

	const editor = useEditor({
		extensions: [StarterKit, Underline, TaskList, TaskItem, Image],
		content: initialContent,
		onCreate: ({ editor }) => {
			// Ensure initial content is set when editor is created
			if (!initialContent || !contentSet) return;
			const format = outputFormat === 'markdown' ? 'html' : 'markdown';
			const formatter = markdownToHtml;
			let contentToSet = format === 'html' ? formatter(initialContent, markdownToHtmlOptions) : initialContent;
			editor.commands.setContent(contentToSet);
			setContentSet(true);
		},
		onSelectionUpdate: ({ editor }) => {
			// Force toolbar update when selection changes
		},
		editorProps: {
			attributes: {
				class: clsx('wiki-editor__content', className),
				placeholder,
				...(name && { 'data-name': name })
			}
		},
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			const value = outputFormat === 'markdown' ? htmlToMarkdown(html, markdownOptions) : html;
			const type = outputFormat === 'markdown' ? 'text/markdown' : 'text/html';

			const eventData = {
				target: { name: name || '', value, type },
				currentTarget: { name: name || '', value, type }
			};

			onChange?.(eventData);
		}
	});

	// Set initial content when editor is ready and when initialContent changes
	React.useEffect(() => {
		if (editor && initialContent && editor.isEditable && !contentSet) {
			// Use setTimeout to ensure editor is fully initialized
			setTimeout(() => {
				try {
					// Convert content based on output format
					let contentToSet = initialContent;
					if (outputFormat === 'markdown') {
						// If output is markdown, convert markdown to HTML for TipTap
						contentToSet = markdownToHtml(initialContent, markdownToHtmlOptions);
					}

					editor.commands.setContent(contentToSet);
					setContentSet(true);
				} catch (error) {
					console.error('Error setting initial content:', error);
				}
			}, 0);
		}
	}, [editor, initialContent, contentSet, outputFormat, markdownToHtmlOptions]);

	return (
		<div className="wiki-editor">
			{showToolbar && editor && (
				<div className="wiki-editor__toolbar">
					<Section editor={editor} group="text" />
					<div className="wiki-editor__toolbar-divider" />
					<Section editor={editor} group="style-selector" />
					<div className="wiki-editor__toolbar-divider" />
					<Section editor={editor} group="lists" />
					<div className="wiki-editor__toolbar-divider" />
					<Section editor={editor} group="blocks" />
					<div className="wiki-editor__toolbar-divider" />
					<Section editor={editor} group="formatting" />
				</div>
			)}
			<EditorContent editor={editor} />
		</div>
	);
};

