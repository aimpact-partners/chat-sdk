import TurndownService from 'turndown';

interface IHtmlToMarkdownOptions {
	headingStyle?: 'setext' | 'atx';
	codeBlockStyle?: 'indented' | 'fenced';
	bulletListMarker?: '-' | '+' | '*';
	emDelimiter?: '_' | '*';
	strongDelimiter?: '__' | '**';
	hr?: string;
}

export function htmlToMarkdown(html: string, options?: IHtmlToMarkdownOptions): string {
	const turndown = new TurndownService({
		headingStyle: options?.headingStyle || 'atx',
		codeBlockStyle: options?.codeBlockStyle || 'fenced',
		bulletListMarker: options?.bulletListMarker || '-',
		emDelimiter: options?.emDelimiter || '*',
		strongDelimiter: options?.strongDelimiter || '**',
		hr: options?.hr || '---',
	});

	// Remover elementos no deseados
	turndown.remove(['script', 'style']);

	// Agregar reglas personalizadas para mejor compatibilidad con Tiptap
	turndown.addRule('strikethrough', {
		filter: ['del', 's', 'strike'],
		replacement: function (content) {
			return '~~' + content + '~~';
		},
	});

	turndown.addRule('underline', {
		filter: ['u'],
		replacement: function (content) {
			return '<u>' + content + '</u>';
		},
	});

	turndown.addRule('taskList', {
		filter: function (node) {
			return node.type === 'checkbox' && node.parentNode?.nodeName === 'LI';
		},
		replacement: function (content, node) {
			const checked = (node as HTMLInputElement).checked;
			return checked ? '[x] ' : '[ ] ';
		},
	});

	return turndown.turndown(html);
}
