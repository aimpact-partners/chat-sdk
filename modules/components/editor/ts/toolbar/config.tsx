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
	EraserIcon
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
	}
];

export const GROUPS = {
	text: 'Text formatting',
	'style-selector': 'Text styles',
	lists: 'Lists',
	blocks: 'Blocks',
	formatting: 'Formatting'
} as const;
