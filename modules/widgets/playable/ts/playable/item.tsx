import React from 'react';
import { Code } from '../code/code';
import { useMarked, Markdown } from '@aimpact/chat-sdk/widgets/markdown';
import { IPlayableItemProps } from './interfaces/playable-props';

/**
 * A  text message can contains more than one block of text,
 * the "block" value represents the number of the block, usually the value
 * is 0 at least you have a message with code blocks.
 *
 */
export const PlayableItem = function ({ block, text, id, index, playable, player, onClickWord }: IPlayableItemProps) {
	const marked = useMarked(text);
	const onClick = event => {
		event.preventDefault();
		event.stopPropagation();

		if (event.target.classList.contains('word')) {
			const word = event.target.dataset.word;
			const wordsArray = text.split(' ');
			const textToPlay = wordsArray.slice(word).join(' ');
			player.positionToCut = parseInt(word);
			player.textId = id;
			//@ts-ignore
			player.play(textToPlay.replaceAll(/[-\\*_#]+/g, '').trim()); // remove markdown characters to avoid reading them with the text-to-speech engine
			if (onClickWord) onClickWord();
			// Implement your logic for playing the text from the clicked word to the end here.
		}
	};

	const attrs = playable ? { onClick } : {};
	if (block.type === 'code') {
		return <Code key={`code-${index}`}>{block.content.replaceAll('`', '')}</Code>;
	}

	const createSpan = (word, i) => `<span data-word="${i}" data-index="${i}${index}" class="word">${word}</span>`;

	function wrapTextWithSpan(htmlString, index) {
		return htmlString.replace(/([^<]+)|(<[^>]+>)/g, (match, text) => {
			// If the match is text (not an HTML tag)
			if (!text) return match;
			// Split the text into words and wrap each word with a span

			return text
				.split(/\s+/)
				.map(word => {
					// Ignore special characters or empty strings
					if (!word.trim() || word.match(/[\.,¿¡!\?;:\-\n\t]/)) return word;
					return createSpan(word, index++);
				})
				.join(' ');
		});
	}

	const markedText = marked.output;
	//@ts-ignore
	const content = markedText.split(' ').map(wrapTextWithSpan).join(' ');

	return (
		//@ts-ignore
		<Markdown key={`content-${index}`} data-block={index} className="message-text__container" {...attrs}>
			{content}
		</Markdown>
	);
};
