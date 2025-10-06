import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { markdownToHtml } from '../utils/markdown-to-html';
import type { IMarkdownToHtmlOptions } from '../types';

interface UseContentInitializerProps {
	editor: Editor | null;
	initialContent: string;
	contentSet: boolean;
	setContentSet: (value: boolean) => void;
	outputFormat: 'html' | 'markdown';
	markdownToHtmlOptions?: IMarkdownToHtmlOptions;
}

export const useContentInitializer = ({
	editor,
	initialContent,
	contentSet,
	setContentSet,
	outputFormat,
	markdownToHtmlOptions
}: UseContentInitializerProps) => {
	React.useEffect(() => {
		// Guard clause: editor must exist
		if (!editor) return;

		// Guard clause: initial content must exist
		if (!initialContent) return;

		// Guard clause: editor must be editable
		if (!editor.isEditable) return;

		// Guard clause: content must not already be set
		if (contentSet) return;

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
	}, [editor, initialContent, contentSet, outputFormat, markdownToHtmlOptions, setContentSet]);
};
