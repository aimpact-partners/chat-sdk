type ContentBlock = {
	content: string;
	isCode: boolean;
};
type TextParsed = [ContentBlock[]?, string?];
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

const cache: Cache = {};

export /*bundle*/ const parseText = (content: string): TextParsed => {
	if (!content) return [[], ''];
	const key = hashContent(content);
	if (key in cache) {
		return cache[key];
	}

	if (!content) {
		cache[key] = [[], ''];
		return [[], ''];
	}

	const result = content
		.split(/(```[\s\S]*?```|`[\s\S]*?`)/)
		.filter(block => block.trim() !== '')
		.map(block => ({
			content: block,
			isCode: block.startsWith('```') || block.startsWith('`'),
		}));

	const playable = result
		.filter(item => !item.isCode)
		.map(item => item.content)
		.join(' ');
	cache[key] = [result, playable];

	return cache[key];
};
