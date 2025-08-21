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
