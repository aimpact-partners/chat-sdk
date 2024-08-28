import React from 'react';
import { mangle } from 'marked-mangle';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
marked.use(mangle());

const options = {
	prefix: 'my-prefix-'
};

marked.use(gfmHeadingId(options));

export /* bundle */ function useMarked() {
	function markContent(content: string) {
		if (!content) return '';

		const result = marked.parse(content);

		return result;
	}

	return markContent;
}
