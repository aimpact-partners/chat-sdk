import React from 'react';
import { useMarked } from '@aimpact/chat-sdk/widgets/markdown';
import { Code } from '../code';
import { IPlayableProps } from './interfaces/playable-props';

export const PlayableItem = React.memo(function ({
	block,
	text,
	id,
	index,
	playable,
	player,
	onClickWord,
}: IPlayableItemProps) {
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

	const createSpan = (word, index) =>
		`<span data-word="${index}" data-index="${index}${index}" class="word">${word}</span>`;

	// const content = mark(block.content).split(' ').map(createSpan).join(' ');

	const content = block.content.split(' ').map(createSpan).join(' ');
	// const content = block.content;
	return (
		<div
			key={`content-${index}`}
			data-block={index}
			className='message-text__container'
			{...attrs}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
});
