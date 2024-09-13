import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown(props) {
	const { ready, output } = useMarked(props.content ?? props.children);
	const attrs = { ...props };

	if (output === '') return null;
	// const content = attrs.children ?? attrs.content;
	// ['content', 'children'].forEach(key => delete attrs[key]);
	// console.log(0.1, content);
	return <div {...attrs} dangerouslySetInnerHTML={{ __html: output }} />;
}
