import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import clsx from 'clsx';
import * as React from 'react';
import { htmlToMarkdown } from '../utils/html-to-markdown';
import { markdownToHtml } from '../utils/markdown-to-html';
import type { IWikiEditorProps } from '../types';

export const useWikiEditor = ({
	name,
	onChange,
	initialContent = '',
	placeholder = 'Escribe algo...',
	className = '',
	outputFormat = 'markdown',
	markdownOptions,
	markdownToHtmlOptions
}: IWikiEditorProps) => {
	const [contentSet, setContentSet] = React.useState(false);

	const editor = useEditor({
		extensions: [StarterKit, TaskList, TaskItem, Image],
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

	return { editor, contentSet, setContentSet };
};
