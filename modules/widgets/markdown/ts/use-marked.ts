import React from 'react';
import { mangle } from 'marked-mangle';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
marked.use(mangle());

const options = {
	prefix: 'my-prefix-',
};

marked.use(gfmHeadingId(options));

export /* bundle */ function useMarked() {
	// React.useEffect(() => {
	// 	marked.use(
	// 		markedHighlight({
	// 			langPrefix: 'hljs language-',
	// 			highlight(code, lang) {
	// 				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
	// 				return hljs.highlight(code, { language }).value;
	// 			},
	// 		})
	// 	);
	// 	hljs.highlightAll();
	// }, []);
	function markContent(content: string) {
		if (!content) return '';

		const result = marked.parse(content);

		return result;
	}

	return markContent;
}
