import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useMarked } from '@aimpact/chat/shared/hooks';
import { Code } from './code';
import { useBoundary } from './use-boundary';
import { parseText } from './parse-content';

interface IPlayableProps {
	content: string;
	autoplay: boolean;
	player: any;
	id: string;
	playable?: boolean;
	onClickWord?: () => void;
	types: string[];
	toolTexts: Record<string, string>;
}

interface IBlocks {
	type: string;
}
function PlayableComponent({ toolTexts, id, playable = true, content, player, onClickWord }: IPlayableProps) {
	const mark = useMarked();
	let autoplay = false;
	const ACTIONS = ['transcription', 'fetching-tool-data', 'kb-processed-response', 'function', 'kb-response'];
	const [blocks, playableContent] = parseText(id, content, ACTIONS);

	const { ref, text, removeHighlight } = useBoundary(id, player, playableContent);
	React.useEffect(() => {
		if (!playable) return;
		const playableContent = blocks.filter(item => item.type === 'code');
		if (autoplay) player.play(playableContent.map(item => item.content).join(' '));
	}, [autoplay, playable]);

	useBinder([player], removeHighlight, 'on.finish');
	if (typeof text !== 'string') return null;

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

	const finalBlocks = blocks.filter(item => !ACTIONS.includes(item.type));
	const output = (() => {
		const attrs = playable ? { onClick } : {};
		return finalBlocks.map((block, i) => {
			const createSpan = (word, index) =>
				`<span data-word="${index}" data-index="${index}${i}" class="word">${word}</span>`;
			if (block.type === 'code') {
				return <Code key={`code-${i}`}>{block.content.replaceAll('`', '')}</Code>;
			}

			const content = mark(block.content.split(' ').map(createSpan).join(' '));
			//content = mark(block.content);
			return (
				<div
					key={`content-${i}`}
					data-block={i}
					className='message-text__container'
					{...attrs}
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			);
		});
	})();

	return <div ref={ref}>{output}</div>;
}

export /* bundle */ const Playable = React.memo(PlayableComponent);
