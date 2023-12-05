import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useMarked } from '@aimpact/chat-sdk/widgets/markdown';
import { Code } from '../code';
import { useBoundary } from '../use-boundary';
import { parseText } from '../parse-content';
import { PlayableItem } from './item';
import { IPlayableProps } from './interfaces/playable-props';

const cache = new Map();

function PlayableComponent({ id, playable = true, content, player, onClickWord }: IPlayableProps) {
	let autoplay = false;

	const ACTIONS = ['transcription', 'fetching-tool-data', 'kb-processed-response', 'function', 'kb-response'];
	const mark = useMarked();

	const [blocks, playableContent] = parseText(id, mark(content), ACTIONS);

	const { ref, text, removeHighlight } = useBoundary(id, player, playableContent);

	React.useEffect(() => {
		if (!playable) return;
		const playableContent = blocks.filter(item => item.type === 'code');
		if (autoplay) player.play(playableContent.map(item => item.content).join(' '));
	}, [autoplay, playable]);

	useBinder([player], removeHighlight, 'on.finish');
	if (typeof text !== 'string') return null;

	const finalBlocks = blocks.filter(item => !ACTIONS.includes(item.type));
	const output = (() => {
		const response = finalBlocks.map((block, i) => (
			<PlayableItem
				key={`content-${i}`}
				onClickWord={onClickWord}
				text={text}
				block={block}
				index={i}
				id={id}
				playable={playable}
				player={player}
			/>
		));

		// return getContent(id, finalBlocks, attrs);
		return response;
	})();

	return <div ref={ref}>{output}</div>;
}

export /* bundle */ const Playable = React.memo(PlayableComponent);
