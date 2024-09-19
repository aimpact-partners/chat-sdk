import React from 'react';
import { IconButton } from 'pragmate-ui/icons';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useChatContext } from '../context';

export function BackArrow({ store, separator }) {
	const icon = React.useRef(null);
	const { attributes, scrollPosition } = useChatContext();
	const ref = React.useRef(null);
	useBinder(
		[store],
		() =>
			globalThis.setTimeout(() => {
				const container = ref.current?.closest('.chat-control__container')?.querySelector('.chat__content');

				if (!container) return;
				const distanceFromBottom = container.scrollHeight - container.clientHeight - container.scrollTop;
				if (distanceFromBottom <= 100) {
					ref.current.classList.remove('show');
					goToBottom();
				} else {
					ref.current.classList.add('show');
				}
			}, 100),
		'new.message',
	);
	const goToBottom = () => {
		separator.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
	};

	React.useEffect(() => {
		const container = ref.current.closest('.chat-control__container').querySelector('.chat__content');

		const handleScroll = () => {
			// Calculate the distance from the bottom
			if (!container) return;
			const distanceFromBottom = container.scrollHeight - container.clientHeight - container.scrollTop;

			// C
			if (distanceFromBottom <= 100) {
				ref.current.classList.remove('show');
			} else {
				ref.current.classList.add('show');
			}
		};

		container.addEventListener('scroll', handleScroll);

		return () => {
			container?.removeEventListener('scroll', handleScroll);
		};
	}, []);

	let cls = `scroll-bottom show circle`;
	if (attributes.has('container')) cls += `scroll-bottom--${attributes.get('container')}`;
	const clsContainer = `container__icon ${
		attributes.has('container') ? ` container--${attributes.get('container')}` : ''
	}`;
	return (
		<div className={clsContainer} ref={ref}>
			<IconButton ref={icon} icon='backArrow' variant='tertiary' className={cls} onClick={goToBottom} />
		</div>
	);
}
