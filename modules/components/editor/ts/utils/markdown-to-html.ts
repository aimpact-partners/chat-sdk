import { marked } from 'marked';
import type { IMarkdownToHtmlOptions } from '../types';

export function markdownToHtml(markdown: string, options?: IMarkdownToHtmlOptions): string {
	// Configurar renderizadores personalizados para mejor compatibilidad con TipTap
	const renderer = new marked.Renderer();

	// Renderizador personalizado para listas de tareas
	renderer.listitem = function (text: any, task: any, checked: any) {
		if (task !== undefined) {
			// Es una lista de tareas
			const checkbox = checked ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>';
			return `<li data-type="taskItem" data-checked="${checked}">${checkbox} ${text}</li>`;
		}
		// Lista normal
		return `<li>${text}</li>`;
	} as any;

	// Renderizador personalizado para listas
	renderer.list = function (body: any, ordered: any) {
		const type = ordered ? 'ol' : 'ul';
		return `<${type}>${body}</${type}>`;
	} as any;

	// Renderizador personalizado para código en línea
	renderer.codespan = function (code: any) {
		return `<code>${code}</code>`;
	} as any;

	// Renderizador personalizado para bloques de código
	renderer.code = function (code: any, language: any) {
		if (language) {
			return `<pre><code class="language-${language}">${code}</code></pre>`;
		}
		return `<pre><code>${code}</code></pre>`;
	} as any;

	// Renderizador personalizado para blockquotes
	renderer.blockquote = function (quote: any) {
		return `<blockquote>${quote}</blockquote>`;
	} as any;

	// Renderizador personalizado para reglas horizontales
	renderer.hr = function () {
		return '<hr>';
	} as any;

	// Aplicar el renderizador personalizado
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
