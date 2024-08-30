import { ParsedElement, ElementType, ParsedText, ParsedContent } from './types';

export class Parser {
	private static types: { type: ElementType; regex: RegExp }[] = [
		{ type: 'math-inline', regex: /\\\(.+?\\\)/g },
		{ type: 'math-block', regex: /\\\[.+?\\\]/g },
		{ type: 'code-inline', regex: /(?<!`)`[^`]+`(?!`)/g },
		{ type: 'code-block', regex: /```[\s\S]+?```/g },
		{ type: 'text', regex: /(.+?)(?=(\\\(.+?\\\)|\\\[.+?\\\]|`[^`]+`|```[\s\S]+?```|$))/gs }
	];

	static parse(input: string): (ParsedElement | ParsedText)[] {
		if (!input) return [];
		const elements: (ParsedElement | ParsedText)[] = [];

		// Primer paso: Identificar todos los bloques principales
		const mainBlocks = this.getBlocks(input);

		// Segundo paso: Procesar los bloques de texto para encontrar inline elements
		for (const block of mainBlocks) {
			if (block.type !== 'text') {
				elements.push(block);
				continue;
			}

			const parsedText = this.getTextBlock(block.content as string);
			elements.push(parsedText);
		}

		return elements;
	}

	private static getBlocks(input: string): ParsedElement[] {
		const elements: ParsedElement[] = [];
		let remainingInput = input;

		while (remainingInput.length > 0) {
			let matched = false;

			for (const { type, regex } of Parser.types) {
				regex.lastIndex = 0; // Reiniciar el índice de búsqueda de la regex
				const match = regex.exec(remainingInput);
				if (match && match.index === 0) {
					elements.push({ type, content: match[0] });
					remainingInput = remainingInput.slice(match[0].length);
					matched = true;
					break;
				}
			}

			if (!matched) {
				const nextMatchIndex = this.findNextMatchIndex(remainingInput);
				const substring = remainingInput.slice(0, nextMatchIndex);
				elements.push({ type: 'text', content: substring });
				remainingInput = remainingInput.slice(substring.length);
			}
		}

		return elements;
	}

	private static findNextMatchIndex(input: string): number {
		let minIndex = input.length;

		for (const { regex } of Parser.types.filter(t => t.type !== 'text')) {
			regex.lastIndex = 0;
			const match = regex.exec(input);
			if (match && match.index < minIndex) {
				minIndex = match.index;
			}
		}

		return minIndex;
	}

	private static getTextBlock(text: string): ParsedText {
		const content: ParsedContent[] = [];
		let remainingText = text;

		while (remainingText.length > 0) {
			let matched = false;

			for (const { type, regex } of Parser.types.filter(t => t.type !== 'text')) {
				const match = regex.exec(remainingText);
				if (!match) continue;

				let string = match[0];
				let limit = match[0].length;
				content.push({ type, content: string });
				matched = true;

				if (match.index !== 0) {
					string = remainingText.slice(0, match.index);
					limit = match.index;
				}

				remainingText = remainingText.slice(limit);
				content.push({ type: 'text', content: string });
			} //end for

			if (!matched) {
				content.push({ type: 'text', content: remainingText });
				break;
			}
		}

		return { type: 'text-block', content };
	}

	static add(type: ElementType, regex: RegExp) {
		Parser.types.push({ type, regex });
	}
}
