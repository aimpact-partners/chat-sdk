import * as React from 'react';
import type { Editor } from '@tiptap/react';
import type { IWikiEditorProps, ILoaders } from '../types';

interface ModuleProviderContextValue {
	editor: Editor | null;
	loaders?: ILoaders;
	name?: string;
	onChange?: (event: any) => void;
	initialContent?: string;
	placeholder?: string;
	className?: string;
	showToolbar?: boolean;
	outputFormat?: 'html' | 'markdown';
	markdownOptions?: any;
	markdownToHtmlOptions?: any;
}

const ModuleProviderContext = React.createContext<ModuleProviderContextValue | null>(null);

interface ModuleProviderProps {
	children: React.ReactNode;
	editor: Editor | null;
	wikiEditorProps: IWikiEditorProps;
}

export const ModuleProvider = ({ children, editor, wikiEditorProps }: ModuleProviderProps) => {
	const contextValue: ModuleProviderContextValue = {
		editor,
		loaders: wikiEditorProps.loaders,
		name: wikiEditorProps.name,
		onChange: wikiEditorProps.onChange,
		initialContent: wikiEditorProps.initialContent,
		placeholder: wikiEditorProps.placeholder,
		className: wikiEditorProps.className,
		showToolbar: wikiEditorProps.showToolbar,
		outputFormat: wikiEditorProps.outputFormat,
		markdownOptions: wikiEditorProps.markdownOptions,
		markdownToHtmlOptions: wikiEditorProps.markdownToHtmlOptions
	};

	return <ModuleProviderContext.Provider value={contextValue}>{children}</ModuleProviderContext.Provider>;
};

export const useModuleProvider = () => {
	const context = React.useContext(ModuleProviderContext);
	if (!context) {
		throw new Error('useModuleProvider must be used within a ModuleProvider');
	}
	return context;
};
