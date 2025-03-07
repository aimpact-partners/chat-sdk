import React from 'react';
import { IconButton } from 'pragmate-ui/icons';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { toast } from 'pragmate-ui/toast';
import { useChatMessagesContext } from '../../context';
export function MessageActions({ text, message, messageTokens, play = true }) {
	const { player, currentMessage, setCurrentMessage } = useChatMessagesContext();
	const [content, setContent] = React.useState(message.content ?? '');
	const [action, setAction] = React.useState('stop');
	const [processing, setProcessing] = React.useState(false);

	useBinder([player], () => setProcessing(player.speaking));
	useBinder([message], () => {
		setContent(message.content ?? '');
	});
	const onChange = () => {
		if (player.textId !== message.id) return;

		setProcessing(false);
		setAction('stop');
	};
	useBinder([player], onChange, 'on.finish');

	const onPlay = async event => {
		event.stopPropagation();

		setAction('play');
		setCurrentMessage(content);
		player.positionToCut = 0;
		player.textId = message.id;
		const parsedText = content.replaceAll(/[-\\*_#]+/g, '').trim();

		await player.play(parsedText, message.id);
	};
	const onPause = async ({ listen }) => {
		await player.stop();
		setAction('stop');
		setProcessing(false);
	};

	const copyMessage = async () => {
		await globalThis?.navigator.clipboard.writeText(text);
		toast.success('Message copied to clipboard');
	};

	const apply = currentMessage?.id === message?.id && processing;

	const icon = action === 'play' ? 'stop' : 'play';
	const onClick = action === 'play' ? onPause : onPlay;

	return (
		<div>
			<div className="audio__actions">
				<IconButton onClick={copyMessage} icon="copy" />
				{play && <IconButton onClick={onClick} data-listen="api" icon={icon} />}
			</div>
			{messageTokens && <div className="tokens overline">{messageTokens} TOKENS</div>}
		</div>
	);
}
