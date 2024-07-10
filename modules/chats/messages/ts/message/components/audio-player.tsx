import { AudioPlayer } from '@aimpact/chat-sdk/audio-player';
import WaveSurfer from 'wavesurfer.js';
import React from 'react';
export function Player({ message }) {
	const src = URL.createObjectURL(message.audio);
	const ref = React.useRef(null);

	React.useEffect(() => {
		const target = ref.current;
		target.addEventListener('loadedmetadata', () => {
			if (target.duration === Infinity) {
				target.currentTime = 1e101;
				target.ontimeupdate = () => {
					target.ontimeupdate = null;
					target.currentTime = 0;
				};
			}
		});
	}, [src]);

	if (!src) return null;

	return (
		<div className="audio-player">
			<audio controls preload="metadata">
				<source src={src} type="audio/mp3" ref={ref} />
				Your browser does not support the audio element.
			</audio>
		</div>
	);
}
