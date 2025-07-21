import { useStore } from '@aimpact/chat-sdk/shared/hooks';
import { IconButton } from 'pragmate-ui/icons';
import { toast } from 'pragmate-ui/toast';
import React from 'react';
import { useChatMessagesContext } from '../../context';
import { formatHour } from '../format-hour';

export function MessageActions({ text, message, messageTokens, play = true }) {
	const { player, setCurrentMessage } = useChatMessagesContext();
	const processing = player.speaking && player.textId === message.id;

	useStore(player, ['on.finish', 'change']);
	useStore(message);

	const onPlay = async event => {
		event.stopPropagation();
		setCurrentMessage(message.content);
		player.positionToCut = 0;
		player.textId = message.id;
		const parsedText = message.content.replaceAll(/[-\\*_#]+/g, '').trim();
		await player.play(parsedText, message.id);
	};

	const onPause = async ({ listen }) => await player.stop();
	const copyMessage = async () => {
		await globalThis?.navigator.clipboard.writeText(text);
		toast.success('Message copied to clipboard');
	};

	const icon = processing ? 'stop' : 'play';
	const onClick = icon === 'play' ? onPlay : onPause;
	if (message.streaming) return null;

	return (
		<section className="message__actions">
			<span className="message__datetime">{formatHour(message.timestamp)}</span>
			<div>
				<div className="audio__actions">
					<IconButton onClick={copyMessage} icon="copy" />
					{play && <IconButton onClick={onClick} data-listen="api" icon={icon} />}
				</div>
				{messageTokens && <div className="tokens overline">{messageTokens} TOKENS</div>}
			</div>
		</section>
	);
}
