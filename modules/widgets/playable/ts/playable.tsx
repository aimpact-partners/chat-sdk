import * as React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useMarked } from '@aimpact/chat/shared/hooks';
import { Code } from './code';
import { useBoundary } from './useBoundary';

interface IPlayableProps {
	content: string;
	autoplay: boolean;
	player: any;
	id: string;
	onClickWord?: () => void;
}
export /* bundle */ function Playable({ id, content, autoplay, player, onClickWord }: IPlayableProps) {
	const mark = useMarked();
	const { ref, text, removeHighlight } = useBoundary(id, player, autoplay, content);
	/**
	 * Split the text into blocks of code and text.
	 */
	const blocks = text
		.split(/(```[\s\S]*?```)/)
		.filter(block => block.trim() !== '')
		.map(block => ({
			content: block,
			isCode: block.startsWith('```'),
		}));

	React.useEffect(() => {
		const playableContent = blocks.filter(item => !item.isCode);
		if (autoplay) player.play(playableContent.map(item => item.content).join(' '));
	}, [autoplay]);

	useBinder([player], removeHighlight, 'on.finish');
	if (typeof text !== 'string') return null;

	const onClick = event => {
		event.preventDefault();
		event.stopPropagation();

		if (event.target.classList.contains('word')) {
			const index = event.target.dataset.index;
			const wordsArray = text.split(' ');
			const textToPlay = wordsArray.slice(index).join(' ');
			player.positionToCut = parseInt(index);
			player.play(textToPlay);
			if (onClickWord) onClickWord();
			// Implement your logic for playing the text from the clicked word to the end here.
		}
	};

	const output = blocks.map((block, i) => {
		const createSpan = (word, index) => `<span data-index="${index}${i}" class="word">${word}</span>`;
		if (block.isCode) {
			return <Code key={`code-${i}`}>{block.content.replaceAll('```', '')}</Code>;
		}
		const content = mark(block.content.replaceAll('\n', '').split(' ').map(createSpan).join(' '));

		return (
			<div
				key={`content-${i}`}
				data-block={i}
				className='message-text__container'
				onClick={onClick}
				dangerouslySetInnerHTML={{ __html: content }}
			/>
		);
	});

	return <div ref={ref}>{output}</div>;
}
