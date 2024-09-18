import React from 'react';
import { mangle } from 'marked-mangle';
import { marked, MarkedOptions } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import katex from 'katex';
import hljs from 'highlight.js'; // Import highlight.js
import { markedHighlight } from 'marked-highlight'; // Import marked-highlight

marked.use(mangle());

const options = {
	prefix: 'my-prefix-'
};

marked.use(gfmHeadingId(options));
interface ExtendedMarkedOptions extends MarkedOptions {
	highlight?: (code: string, lang: string) => string;
}

export function useMarked(content: string) {
	const [output, setOutput] = React.useState<string>('');

	async function render(content) {
		const options: ExtendedMarkedOptions = {
			breaks: false // Disable line breaks for Markdown
		};

		marked.setOptions(options);
		marked.use(
			markedHighlight({
				async: true,
				langPrefix: 'language-', // Default langPrefix used by highlight.js
				highlight(code, lang) {
					const language = hljs.getLanguage(lang) ? lang : 'plaintext';
					return hljs.highlight(code, { language }).value;
				}
			})
		);

		// 1. Temporarily replace inline and block math expressions with placeholders
		let placeholderCounter = 0;
		const mathPlaceholders = {};
		const placeholderPrefix = 'MATH_PLACEHOLDER_';

		content = content.replace(/\\\((.*?)\\\)/g, (match, mathContent) => {
			const placeholder = `${placeholderPrefix}${placeholderCounter++}`;
			mathPlaceholders[placeholder] = katex.renderToString(mathContent, { displayMode: false });
			return placeholder;
		});

		content = content.replace(/\\\[(.*?)\\\]/gs, (match, mathContent) => {
			const placeholder = `${placeholderPrefix}${placeholderCounter++}`;
			mathPlaceholders[placeholder] = katex.renderToString(mathContent, { displayMode: true });
			return placeholder;
		});

		// 2. Pass the content through marked
		let output = await marked(content, { breaks: false });

		// 3. Replace placeholders with actual rendered KaTeX
		Object.keys(mathPlaceholders).forEach(placeholder => {
			output = output.replace(new RegExp(placeholder, 'g'), mathPlaceholders[placeholder]);
		});

		setOutput(output);
	}

	React.useEffect(() => {
		render(content ?? '');
	}, [content]);

	return {
		ready: !!output,
		output
	};
}
