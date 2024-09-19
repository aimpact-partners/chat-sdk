export type ElementType = 'math-inline' | 'math-block' | 'code-inline' | 'code-block' | 'text-block' | 'text-inline';

export interface ParsedElement {
	type: ElementType;
	content: string | ParsedText;
}

export interface ParsedContent {
	type: ElementType;
	content: string;
}

export interface ParsedText {
	type: 'text-block';
	content: ParsedContent[];
}

export type InlineElementType = ParsedElement;

export type ElementTypeRenderer = {
	'text-block': (text: ParsedText) => JSX.Element;
} & {
	[key in Exclude<ElementType, 'text-block'>]: (content: string) => JSX.Element;
};

export interface ContentRendererProps {
	content: string;
}
