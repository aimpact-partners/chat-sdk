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
		extensions: [StarterKit, Underline, TaskList, TaskItem],
		content: initialContent,
		onCreate: ({ editor }) => {
			// Ensure initial content is set when editor is created
			if (initialContent && !contentSet) {
				// Convert content based on output format
				let contentToSet = initialContent;
				if (outputFormat === 'markdown') {
					// If output is markdown, convert markdown to HTML for TipTap
					contentToSet = markdownToHtml(initialContent, markdownToHtmlOptions);
				}

				editor.commands.setContent(contentToSet);
				setContentSet(true);
			}
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
