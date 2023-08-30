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
	playable?: boolean;
	onClickWord?: () => void;
}
function PlayableComponent({ id, playable = true, content, player, onClickWord }: IPlayableProps) {
	const mark = useMarked();
	let autoplay = false;
	const { ref, text, removeHighlight } = useBoundary(id, player, content);
	/**
	 * Split the text into blocks of code and text.
	 */

	const blocks = React.useMemo(() => {
		if (!playable) return [];
		return content
			.split(/(```[\s\S]*?``` | `[\s\S]*?`)/)
			.filter(block => block.trim() !== '')
			.map(block => {
				const content = block.trim();
				return {
					content,
					isCode: content.startsWith('```') || content.startsWith('`'),
				};
			});
	}, [content, playable]);

	React.useEffect(() => {
		if (!playable) return;
		const playableContent = blocks.filter(item => !item.isCode);
		if (autoplay) player.play(playableContent.map(item => item.content).join(' '));
	}, [autoplay, playable]);

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

	const output = React.useMemo(() => {
		if (!playable) {
			const output = mark(content);
			return <div className='message-text__container word' dangerouslySetInnerHTML={{ __html: output }} />;
		}
		return blocks.map((block, i) => {
			const createSpan = (word, index) => `<span data-index="${index}${i}" class="word">${word}</span>`;
			if (block.isCode) {
				return <Code key={`code-${i}`}>{block.content.replaceAll('`', '')}</Code>;
			}

			const content = mark(block.content.split(' ').map(createSpan).join(' '));
			//content = mark(block.content);
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
	}, [content, playable]);

	return <div ref={ref}>{output}</div>;
}

export /* bundle */ const Playable = React.memo(PlayableComponent);
