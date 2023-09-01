import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
export function useBoundary(id, player, content) {
	const ref = React.useRef(null);
	const [text, setText] = React.useState<string>(content ?? '');

	const removeHighlight = () => {
		ref.current.querySelectorAll('.highlight').forEach(element => element.classList.remove('highlight'));
	};

	useBinder(
		[player],
		() => {
			console.log(87, id, player.textId);
			if (id !== player.textId) return;
			const currentIndex = player.currentWord;
			const block = ref.current.querySelector('.message-text__container')?.dataset.block;

			if (player.positionToCut > 0) {
				const segmentToCut = player.text.slice(0, currentIndex).split(' ').length - 1;
				const finalPosition = player.positionToCut + segmentToCut;

				removeHighlight();
				if (!ref.current.querySelector(`[data-index="${finalPosition}"]`)) return;
				ref.current.querySelector(`[data-index="${finalPosition}"]`).classList.add('highlight');
				return;
			}

			const segment = text.slice(0, currentIndex);
			const position = segment.split(' ').length - 1;

			removeHighlight();
			ref.current.querySelector(`[data-index="${position}${block}"]`).classList.add('highlight');
		},
		'boundary'
	);

	return { ref, text, removeHighlight };
}
