import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown(props) {
	const mark = useMarked();
	const attrs = { ...props };
	const content = attrs.children ?? attrs.content;
	['content', 'children'].forEach(key => delete attrs[key]);
	// console.log(0.1, content);
	return <div {...attrs} dangerouslySetInnerHTML={{ __html: mark(content) }} />;
}
