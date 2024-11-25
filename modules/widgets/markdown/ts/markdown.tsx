import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown(props) {
	const { ready, output } = useMarked(props.content ?? props.children);
	const attrs = { ...props };

	if (output === '') return null;

	return <div {...attrs} dangerouslySetInnerHTML={{ __html: output }} />;
}
