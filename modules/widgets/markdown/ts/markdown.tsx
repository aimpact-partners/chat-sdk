import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown({ content, children, ...props }: { content?: string; children?: string }) {
	const { output } = useMarked(content ?? children);
	const attrs = { ...props };
	if (output === '') return null;

	return <div {...attrs} dangerouslySetInnerHTML={{ __html: output as string }} />;
}
