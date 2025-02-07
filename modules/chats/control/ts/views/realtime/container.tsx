import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicIcon, PhoneIcon, SpeakerIcon } from './icons';
import { useChatContext } from '../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { IconButton } from 'pragmate-ui/icons';
import { Image } from 'pragmate-ui/image';
import { RealtimeStatus } from './status';

export function RealtimePanel({ isVisible }: { isVisible: boolean }) {
	const { store, setShowRealtime } = useChatContext();
	const { valid } = store.realtime.client;

	const [updated, setUpdated] = React.useState({});
	useBinder([store.realtime], () => {
		setUpdated({});
	});

	const callStatus = store.realtime.client.status;
	const speakerIcon = true ? 'call' : 'callEnd';

	if (!valid) {
		const { recorder, player } = store.realtime.client;
		const errors = [];
		if (recorder?.error) {
			errors.push(<div key="recorder-error">• Recorder is invalid: {recorder.error.message}</div>);
		}
		if (player?.error) {
			errors.push(<div key="player-error">• Audio player is invalid: {player.error.message}</div>);
		}

		return (
			<div className="phone flex items-center justify-center min-h-screen bg-gray-100">
				<div>Errors found:</div>
				{errors}
			</div>
		);
	}

	const onMicClick = () => {
		store.realtime.onmic();
	};

	const hangup = () => {
		store.realtime.call();
		setShowRealtime(false);
	};
	const micIcon = store.realtime.muted ? 'micOff' : 'mic';
	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="realtime-panel"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
				>
					{/* Your content here */}
					<Image className="app-logo" src="/assets/rvd/logo.png" />
					<RealtimeStatus />

					<div className="realtime-actions__container">
						<IconButton disabled={callStatus !== 'created'} icon={micIcon} onClick={onMicClick} />
						<IconButton className="call-icon" icon={speakerIcon} onClick={hangup} />
						{/* <PhoneIcon isOff={true} /> */}
						{/* <SpeakerIcon isOff={true} /> */}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
