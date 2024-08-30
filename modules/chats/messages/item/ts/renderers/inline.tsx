import React from 'react';
import { ElementType } from '../types';
import { TextRenderer } from './text';
import { InlineMath } from 'react-katex';

export function InlineRenderer({ type, content }: { type: ElementType; content: string }) {
	const renders = {
		// 'math-inline': content => <MathJax inline>{content}</MathJax>,
		'math-inline': content => {
			const process = text => {
				// Replace double backslashes with single backslashes
				return text.replaceAll(`\\`, '');
			};
			// console.log(20, content, process(content));
			return <InlineMath math={process(content)} />;
		},
		'code-inline': content => <code>{content.slice(1, -1)}</code>, // Eliminar los backticks (`) del inicio y fin
		text: content => {
			return <TextRenderer content={content} />;
		}
	};

	return renders[type](content);
}
