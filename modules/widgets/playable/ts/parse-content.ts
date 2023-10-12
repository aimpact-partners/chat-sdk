type ContentBlock = {
	content: string;
	type: string;
};
export type TextParsed = [ContentBlock[]?, string?];
type Cache = { [key: string]: TextParsed };

const hashContent = (content: string) => {
	let hash = 0,
		i,
		chr;
	for (i = 0; i < content.length; i++) {
		chr = content.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convertir a entero de 32 bits
	}
	return hash.toString();
};

function validateTools(content): { type: string; value: any }[] {
	if (typeof content !== 'string') {
		throw new Error('Input must be a string.');
	}

	const regex = /😸(.*?)🖋️/g;
	let outputArray = [];
	let previousIndex = 0;

	for (const match of content.matchAll(regex)) {
		const [fullMatch, innerContent] = match;

		// Push preceding text as 'string'
		const precedingText = content.slice(previousIndex, match.index);
		if (precedingText) {
			outputArray.push({ type: 'string', value: precedingText });
			continue;
		}

		// Push matched text as 'tool'
		try {
			const { type, data } = JSON.parse(innerContent);
			outputArray.push({ type, data });
			previousIndex = match.index + fullMatch.length;
		} catch (e) {
			console.error(e);
		}
	} // end for;

	// Push remaining text as 'string'
	const remainingText = content.slice(previousIndex);
	if (remainingText) {
		outputArray.push({ type: 'string', value: remainingText });
	}

	return outputArray;
}

const cache: Cache = {};

export /*bundle*/ const parseText = (key, content: string, ACTIONS: string[]): TextParsed => {
	if (!content) return [[], ''];
	// const key = hashContent(content);

	// Ahora puedes usar 'key' como una clave única.

	if (key in cache && cache[key][1]?.length === content.length) {
		return cache[key];
	}

	if (!content) {
		cache[key] = [[], ''];
		return [[], ''];
	}

	const initial = validateTools(content);

	let elements = [];
	const actions = [];
	initial.forEach(item => {
		if (ACTIONS.includes(item.type)) {
			actions.push(item);
			return;
		}

		const result = item.value
			.split(/(```[\s\S]*?```|`[\s\S]*?`)/)
			.filter(block => block.trim() !== '')
			.map(block => ({
				content: block,
				type: block.startsWith('```') || block.startsWith('`') ? 'code' : 'text',
			}));
		elements = [...elements, ...result];
	});

	const playable = elements
		.filter(item => item.type === 'text')
		.map(item => item.content)
		.join(' ');

	cache[key] = [elements, playable, actions];

	return cache[key];
};
