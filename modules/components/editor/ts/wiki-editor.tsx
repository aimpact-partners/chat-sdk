import { EditorContent } from '@tiptap/react';
import * as React from 'react';
import { Section } from './toolbar';
import type { IWikiEditorProps } from './types';
import { useWikiEditor, useContentInitializer } from './hooks';
import { ModuleProvider } from './provider';

export /*bundle*/ const WikiEditor = ({
	name,
	onChange,
	initialContent = '',
	placeholder = 'Escribe algo...',
	className = '',
	showToolbar = true,
	outputFormat = 'markdown', // Por defecto Markdown como solicitaste
	markdownOptions,
	loaders,
	markdownToHtmlOptions
}: IWikiEditorProps): JSX.Element => {
	const { editor, contentSet, setContentSet } = useWikiEditor({
		name,
		onChange,
		initialContent,
		placeholder,
		className,
		outputFormat,
		markdownOptions,
		loaders,
		markdownToHtmlOptions
	});

	useContentInitializer({
		editor,
		initialContent,
		contentSet,
		setContentSet,
		outputFormat,
		markdownToHtmlOptions
	});

	return (
		<ModuleProvider
			editor={editor}
			wikiEditorProps={{
				name,
				onChange,
				initialContent,
				placeholder,
				className,
				showToolbar,
				outputFormat,
				markdownOptions,
				loaders,
				markdownToHtmlOptions
			}}
		>
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
		</ModuleProvider>
	);
};
