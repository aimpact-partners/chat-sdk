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
			breaks: false // Enable line breaks for Markdown
			// highlight: (code, lang) => {
			// 	// Check if the language is valid, otherwise fall back to 'plaintext'
			// 	const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			// 	return hljs.highlight(code, { language }).value; // Return the highlighted code
			// }
		};
		marked.setOptions(options);
		marked.use(
			markedHighlight({
				async: true,
				langPrefix: 'language-', // Default langPrefix used by highlight.js
				highlight(code, lang) {
					// Check if the language is valid, otherwise fall back to 'plaintext'
					const language = hljs.getLanguage(lang) ? lang : 'plaintext';
					return hljs.highlight(code, { language }).value;
				}
			})
		);

		let output = await marked(content, {
			breaks: true
		});

		// Adjusted regex to match the processed block math delimiters `[ ... ]`
		output = output
			.replace(/\[([\s\S]+?)\]/g, (match, mathContent) => {
				try {
					return katex.renderToString(mathContent, { displayMode: true });
				} catch (error) {
					console.error('Error rendering block KaTeX:', error);
					return match; // Return the original text if there is an error
				}
			})
			// Match inline math (if needed)
			.replace(/\\\((.+?)\\\)/g, (match, mathContent) => {
				try {
					return katex.renderToString(mathContent, { displayMode: false });
				} catch (error) {
					console.error('Error rendering inline KaTeX:', error);
					return match;
				}
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
