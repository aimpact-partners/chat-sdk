import React from 'react';
import MarkdownIt from 'markdown-it';
// import markdownItMath from 'markdown-it-math';
import DOMPurify from 'dompurify';

const mdParser = new MarkdownIt();

export function TextRenderer({ content }: { content: string }) {
	console.log(0.5, content);
	const sanitizedContent = DOMPurify.sanitize(mdParser.renderInline(content));
	return <span dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
}
