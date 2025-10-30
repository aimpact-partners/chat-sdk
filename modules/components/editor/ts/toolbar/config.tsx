import {
	CheckboxIcon,
	CodeIcon,
	DividerHorizontalIcon,
	EraserIcon,
	FontBoldIcon,
	FontItalicIcon,
	HamburgerMenuIcon,
	ImageIcon,
	ListBulletIcon,
	QuoteIcon,
	StrikethroughIcon,
	TextIcon,
	UnderlineIcon
} from '@radix-ui/react-icons';
import type { Editor } from '@tiptap/react';
import * as React from 'react';
import { IButton } from '../types/i-button';

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

	{
		id: 'image',
		label: 'Image',
		title: 'Image',
		group: 'formatting',
		icon: <ImageIcon width={16} height={16} />,
		action: (editor: Editor) => {
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
