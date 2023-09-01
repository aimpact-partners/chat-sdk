import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown({ content }) {
	const mark = useMarked();

	return <div dangerouslySetInnerHTML={{ __html: mark(content) }} />;
}
