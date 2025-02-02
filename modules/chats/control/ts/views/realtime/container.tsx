import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicIcon, PhoneIcon, SpeakerIcon } from './icons';
import { useChatContext } from '../context';
import { useBinder } from '@beyond-js/react-18-widgets/hooks';
import { IconButton } from 'pragmate-ui/icons';

export function RealtimePanel({ isVisible }: { isVisible: boolean }) {
	const { store } = useChatContext();
	const { status, valid } = store.realtime.client;
	const active = ['connecting', 'open', 'created'].includes(status);
	const [updated, setUpdated] = React.useState({});
	useBinder([store.realtime], () => {
		setUpdated({});
	});
	const mins = Math.floor(store.realtime.duration / 60);
	const secs = store.realtime.duration % 60;
	const timer = `${mins}:${secs.toString().padStart(2, '0')}`;
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

					<div className="realtime-actions__container">
						<button
							onClick={() => {
								store.realtime.onmic();
							}}
						>
							<MicIcon isMuted={store.realtime.muted} />
						</button>
						<IconButton icon={speakerIcon} />
						{/* <PhoneIcon isOff={true} /> */}
						<SpeakerIcon isOff={true} />
					</div>
					<div className="text-center mb-8">
						<p className="text-gray-500">
							{status === 'closed' && 'Ready to call'}
							{status === 'connecting' && 'Calling.'}
							{status === 'open' && 'Calling...'}
							{status === 'closing' && 'Hunging up'}
							{status === 'created' && timer}
						</p>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
