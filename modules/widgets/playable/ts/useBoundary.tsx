import * as React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
export function useBoundary(id, player, autoplay, content) {
	const ref = React.useRef(null);
	const [text, setText] = React.useState<string>(content ?? '');
	const [cutIndex, setCutIndex] = React.useState<number>(0);
	const removeHighlight = () => {
		ref.current.querySelectorAll('.highlight').forEach(element => element.classList.remove('highlight'));
	};

	useBinder(
		[player],
		() => {
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

			const endOfWordIndex = text.indexOf(' ', currentIndex);
			const segment = text.slice(0, currentIndex);
			const position = segment.split(' ').length - 1;

			removeHighlight();
			ref.current.querySelector(`[data-index="${position}${block}"]`).classList.add('highlight');
		},
		'boundary'
	);

	return { ref, text, removeHighlight };
}
