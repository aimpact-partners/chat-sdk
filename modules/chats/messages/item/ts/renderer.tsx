import React, { useMemo } from 'react';

import { Parser } from './parser'; // Importa la clase Parser que creamos anteriormente
import { ContentRendererProps, ParsedContent, ParsedElement, ParsedText } from './types';
import { InlineRenderer } from './renderers/inline';
import { BlockRenderer, TextBlockRenderer } from './renderers/block';

export function ContentRenderer({ content }: ContentRendererProps) {
	const elements = useMemo(() => Parser.parse(content), [content]);

	const output = elements.map((el: ParsedElement | ParsedText, index) => {
		const isTextOrInline = el.type === 'text-block' || el.type.includes('-inline');
		const space = isTextOrInline && index > 0 ? ' ' : '';

		if ((el as ParsedText).type === 'text-block') {
			return <TextBlockRenderer items={el.content as ParsedContent[]} key={index} />;
		}
		if (isTextOrInline) return <InlineRenderer type={el.type} content={el.content as string} key={index} />;

		const output = <BlockRenderer type={el.type} content={(el as ParsedContent).content} />;

		return (
			<React.Fragment key={index}>
				{space}
				{output}
			</React.Fragment>
		);
	});

	return <>{output}</>;
}
