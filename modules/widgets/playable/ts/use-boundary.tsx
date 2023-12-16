import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
export function useBoundary(id, player, content) {
	const ref = React.useRef(null);
	const [text, setText] = React.useState<string>(content ?? '');

	const removeHighlight = () => {
		ref.current.querySelectorAll('.highlight').forEach(element => element.classList.remove('highlight'));
	};

	React.useEffect(() => {
		/**
		 * todo: @jircdev content replacemennt is being done here and in item.tsx
		 */
		content = content.replaceAll(/[-\\*_#\n\t]+/g, '').trim();

		const onBoundary = () => {
			if (id !== player.textId) return;
			const currentIndex = player.currentWord;
			const block = ref.current.querySelector('.message-text__container')?.dataset.block;
			let finalPosition = `0`;

			if (player.positionToCut > 0) {
				const segmentToCut = player.text.slice(0, currentIndex).split(' ').length - 1;
				finalPosition = `${player.positionToCut + segmentToCut}${block}`;

				removeHighlight();
				if (!ref.current.querySelector(`[data-index="${finalPosition}"]`)) {
					return;
				}
				ref.current.querySelector(`[data-index="${finalPosition}"]`).classList.add('highlight');
				return;
			}

			const segment = content.slice(0, currentIndex);
			const position = segment.split(' ').length - 1;
			finalPosition = `${position}${block}`;
			removeHighlight();
			ref.current.querySelector(`[data-index="${finalPosition}"]`)?.classList.add('highlight');
		};

		player.on('boundary', onBoundary);
		return () => {
			player.off('boundary', onBoundary);
		};
	}, [content]);

	return { ref, text: content, removeHighlight };
}
