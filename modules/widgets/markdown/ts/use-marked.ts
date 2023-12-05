import React from 'react';
import { mangle } from 'marked-mangle';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
marked.use(mangle());
export /* bundle */ function useMarked() {
	React.useEffect(() => {
		marked.use(
			markedHighlight({
				langPrefix: 'hljs language-',
				highlight(code, lang) {
					const language = hljs.getLanguage(lang) ? lang : 'plaintext';
					return hljs.highlight(code, { language }).value;
				},
			})
		);

		hljs.highlightAll();
	}, []);

	function markContent(content: string) {
		if (!content) return '';
		return marked(content, { headerIds: false, headerPrefix: false });
	}

	return markContent;
}
