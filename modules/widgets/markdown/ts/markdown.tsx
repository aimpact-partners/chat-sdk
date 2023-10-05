import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown({ content }) {
	const mark = useMarked();
	// console.log(0.1, content);
	return <div dangerouslySetInnerHTML={{ __html: mark(content) }} />;
}
