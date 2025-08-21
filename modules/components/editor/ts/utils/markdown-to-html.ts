import { marked } from 'marked';

interface IMarkdownToHtmlOptions {
	// Opciones para la conversión de Markdown a HTML
	gfm?: boolean; // GitHub Flavored Markdown
	breaks?: boolean; // Convertir saltos de línea a <br>
	headerIds?: boolean; // Agregar IDs a los headers
	mangle?: boolean; // Mangle email addresses
	headerPrefix?: string; // Prefijo para IDs de headers
}

export function markdownToHtml(markdown: string, options?: IMarkdownToHtmlOptions): string {
	// Configurar marked con las opciones
	marked.setOptions({
		gfm: options?.gfm ?? true, // GitHub Flavored Markdown por defecto
		breaks: options?.breaks ?? false, // No convertir saltos de línea por defecto
		headerIds: options?.headerIds ?? true, // IDs en headers por defecto
		mangle: options?.mangle ?? false, // No manglear emails por defecto
		headerPrefix: options?.headerPrefix ?? 'wiki-editor-'
	});

	// Configurar renderizadores personalizados para mejor compatibilidad con TipTap
	const renderer = new marked.Renderer();

	// Renderizador personalizado para listas de tareas
	renderer.listitem = function (text, task, checked) {
		if (task !== undefined) {
			// Es una lista de tareas
			const checkbox = checked ? '<input type="checkbox" checked disabled>' : '<input type="checkbox" disabled>';
			return `<li data-type="taskItem" data-checked="${checked}">${checkbox} ${text}</li>`;
		}
		// Lista normal
		return `<li>${text}</li>`;
	};

	// Renderizador personalizado para listas
	renderer.list = function (body, ordered) {
		const type = ordered ? 'ol' : 'ul';
		return `<${type}>${body}</${type}>`;
	};

	// Renderizador personalizado para código en línea
	renderer.codespan = function (code) {
		return `<code>${code}</code>`;
	};

	// Renderizador personalizado para bloques de código
	renderer.code = function (code, language) {
		if (language) {
			return `<pre><code class="language-${language}">${code}</code></pre>`;
		}
		return `<pre><code>${code}</code></pre>`;
	};

	// Renderizador personalizado para blockquotes
	renderer.blockquote = function (quote) {
		return `<blockquote>${quote}</blockquote>`;
	};

	// Renderizador personalizado para reglas horizontales
	renderer.hr = function () {
		return '<hr>';
	};

	// Aplicar el renderizador personalizado
	marked.use({ renderer });

	try {
		// Convertir Markdown a HTML
		const html = marked(markdown);
		return html;
	} catch (error) {
		console.error('Error converting markdown to HTML:', error);
		// En caso de error, devolver el markdown original envuelto en un párrafo
		return `<p>${markdown}</p>`;
	}
}
