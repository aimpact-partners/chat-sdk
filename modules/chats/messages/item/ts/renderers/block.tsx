import React from 'react';
import { ElementType, ParsedContent, ParsedText } from '../types';
import { InlineRenderer } from './inline';
import okaidia from './okaidia';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { BlockMath } from 'react-katex';
export function BlockRenderer({ type, content }: { type: ElementType; content: string }) {
	const renders = {
		'math-block': content => {
			const process = expression => {
				// Remover únicamente los delimitadores externos \[ y \]
				const trimmedExpression = expression.trim();
				if (trimmedExpression.startsWith('\\[') && trimmedExpression.endsWith('\\]')) {
					return trimmedExpression.slice(2, -2); // Elimina \[ y \]
				}
				return expression;
			};

			return (
				<div className="mathjax-container">
					{/* <MathJax>{content}</MathJax> */}
					<BlockMath math={process(content)} />
				</div>
			);
		},
		'code-block': content => (
			<div className="code-block__container">
				<SyntaxHighlighter language="typescript" style={okaidia} className="syntax-highlighter dark">
					{content.slice(3, -3)}
				</SyntaxHighlighter>{' '}
				// Eliminar los tres backticks (```) del inicio y fin
			</div>
		)
	};

	return renders[type](content);
}

export function TextBlockRenderer({ items = [] }: { items: ParsedText['content'] }) {
	return (
		<p>
			{items.map(({ type, content }: ParsedContent, index) => (
				<InlineRenderer type={type} content={content} key={index} />
			))}
		</p>
	);

	// return <span>parsed text</span>;
}
