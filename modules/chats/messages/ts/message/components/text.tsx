import React from 'react';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { Playable } from '@aimpact/chat-sdk/widgets/playable';
import { AudioPlayer } from 'media-suite/audio-player';
import { useChatMessagesContext } from '../../context';
import { Spinner } from 'pragmate-ui/components';

export function MessageText({ message, playable, fetching, autoplay = false }) {
	const text = message?.content ?? '';
	const ref = React.useRef(null);
	const { texts, player, currentMessage, setCurrentMessage } = useChatMessagesContext();
	const removeHighlight = () => {
		ref.current.querySelectorAll('.highlight').forEach(element => element.classList.remove('highlight'));
	};

	useBinder([player], removeHighlight, 'on.finish');
	if (typeof text !== 'string') return null;

	const onClickWord = event => setCurrentMessage(message);
	const canBePlayed = message && message.role !== 'user' && autoplay;
	const autoplayValue = message.id === currentMessage?.id && canBePlayed;

	return (
		<div className="message-text__container p2" ref={ref}>
			{text && (
				<Playable
					content={text}
					autoplay={autoplayValue && canBePlayed}
					player={player}
					id={message.id}
					playable={playable}
					onClickWord={onClickWord}
					toolTexts={texts.tools}
				/>
			)}
			{/* {fetching && <Spinner variant='primary' size='sm' active className='spinner-text' />} */}
			{message.audio && <AudioPlayer src={message.audio} convert />}
		</div>
	);
}
