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
