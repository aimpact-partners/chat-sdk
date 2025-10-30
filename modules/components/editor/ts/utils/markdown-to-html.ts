import { marked } from 'marked';
import type { IMarkdownToHtmlOptions } from '../types';

export function markdownToHtml(markdown: string, options?: IMarkdownToHtmlOptions): string {
	// Configurar renderizadores personalizados para mejor compatibilidad con TipTap
	const renderer = new marked.Renderer();

	marked.use({ renderer });

	try {
		// Convertir Markdown a HTML
		const html = marked.parse(markdown) as string;
		return html;
	} catch (error) {
		console.error('Error converting markdown to HTML:', error);
		// En caso de error, devolver el markdown original envuelto en un párrafo
		return `<p>${markdown}</p>`;
	}
}
