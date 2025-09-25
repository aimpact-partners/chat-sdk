import React from 'react';
import { useMarked } from './use-marked';

export /*bundle */ function Markdown({
	content,
	children,
	inline = false,
	...props
}: {
	content?: string;
	children?: string;
	inline?: boolean;
}) {
	const { output } = useMarked(content ?? children, inline);
	const attrs = { ...props };
	if (output === '') return null;

	// Use span for inline content, div for block content
	const Tag = inline ? 'span' : 'div';
	return <Tag {...attrs} dangerouslySetInnerHTML={{ __html: output as string }} />;
}
