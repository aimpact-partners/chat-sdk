import * as React from 'react';
import { IconButton, Icon } from 'pragmate-ui/icons';
export /*bundle */ function PlayerButton(props) {
	const { player, id, content } = props;
	const [action, setAction] = React.useState('stop');
	const [processing, setProcessing] = React.useState(false);
	const onPlay = async ({ listen }) => {
		setAction('play');
		player.positionToCut = 0;
		await player.play(content, id);
	};
	const onPause = async ({ listen }) => {
		await player.stop();
		setAction('stop');
		setProcessing(false);
	};

	const apply = id === player.id;
	const icon = apply || action === 'play' ? 'stop' : 'play';
	const onClick = apply || action === 'play' ? onPause : onPlay;

	return <IconButton onClick={onClick} data-listen='api' icon={icon} className='lg' />;
}
