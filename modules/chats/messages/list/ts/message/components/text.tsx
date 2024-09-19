import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { useChatMessagesContext } from '../../context';
import { Player } from './audio-player';
import { MessageContent } from './message';

export function MessageText({ message, playable, fetching, autoplay = false }) {
	const ref = React.useRef(null);
	const { texts, player, currentMessage, setCurrentMessage } = useChatMessagesContext();
	const removeHighlight = () => {
		ref.current.querySelectorAll('.highlight').forEach(element => element.classList.remove('highlight'));
	};
	const [text, setText] = React.useState(message.content ?? '');
	useBinder(
		[message],
		() => {
			setText(message.content ?? '');
		},
		'change'
	);
	useBinder([player], removeHighlight, 'on.finish');
	if (typeof text !== 'string') return null;

	const onClickWord = event => setCurrentMessage(message);
	const canBePlayed = message && message.role !== 'user' && autoplay;
	const autoplayValue = message.id === currentMessage?.id && canBePlayed;

	return (
		<div className="message-text__container p2" ref={ref}>
			{/* <MessageContent>{text}</MessageContent> */}
			<div>{text}</div>
			{/* {text && (
				<Playable
					content={text}
					autoplay={autoplayValue && canBePlayed}
					player={player}
					id={message.id}
					playable={playable}
					onClickWord={onClickWord}
					toolTexts={texts.tools}
				/>
			)} */}
			{/* {fetching && <Spinner variant='primary' size='sm' active className='spinner-text' />} */}
			{message.audio && <Player message={message} />}
		</div>
	);
}
