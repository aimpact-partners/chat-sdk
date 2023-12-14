import React from 'react';
import { Code } from '../code/code';
import { useMarked, Markdown } from '@aimpact/chat-sdk/widgets/markdown';

/**
 * A  text message can contains more than one block of text,
 * the "block" value represents the number of the block, usually the value
 * is 0 at least you have a message with code blocks.
 *
 */
export const PlayableItem = function ({ block, text, id, index, playable, player, onClickWord }: IPlayableItemProps) {
	const marked = useMarked();
	const onClick = event => {
		event.preventDefault();
		event.stopPropagation();

		if (event.target.classList.contains('word')) {
			const word = event.target.dataset.word;
			const wordsArray = text.split(' ');
			const textToPlay = wordsArray.slice(word).join(' ');
			player.positionToCut = parseInt(word);
			player.textId = id;

			player.play(textToPlay);
			if (onClickWord) onClickWord();
			// Implement your logic for playing the text from the clicked word to the end here.
		}
	};

	const attrs = playable ? { onClick } : {};
	if (block.type === 'code') {
		return <Code key={`code-${index}`}>{block.content.replaceAll('`', '')}</Code>;
	}

	const createSpan = (word, i) => `<span data-word="${i}" data-index="${i}${index}" class="word">${word}</span>`;
	const markedText = marked(block.content);
	const content = markedText.split(' ').map(createSpan).join(' ');
	// const content = block.content;
	return (
		<div key={`content-${index}`} data-block={index} className='message-text__container' {...attrs}>
			<Markdown content={content} />
		</div>
	);
};
