import * as React from 'react';
import { ContentRenderer } from './renderer';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

import katex from 'markdown-it-katex';

const settings = {
	html: true,
	linkify: true,
	typographer: true,
	highlight: (str, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return (
					'<hr><pre class="hljs"><code>' + hljs.highlight(str, { language: lang }).value + '</code></pre><hr>'
				);
			} catch (__) {}
		}
		return '<hr><pre class="hljs"><code>' + mdParser.utils.escapeHtml(str) + '</code></pre><hr>';
	}
};

const mdParser = new MarkdownIt(settings).use(katex);

// Confi

export /*bundle*/
function Message({ message }: { message: any }) {
	const [content, setContent] = React.useState(message.content ?? '');

	const sanitizedContent = mdParser.render(message.content ?? '');
	useBinder([message], () => {
		setContent(message.content ?? '');
	});
	return (
		<>
			<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
		</>
	);
}
