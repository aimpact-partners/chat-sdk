import React from 'react';
import { useComponentAudioContext } from './context';
import WaveSurfer from 'wavesurfer.js';

export function Visualizer() {
	const { buffer, audio } = useComponentAudioContext();
	const ref = React.useRef(null);
	React.useEffect(() => {
		// const blobUrl = URL.createObjectURL(message.audio);
		const wavesurfer = WaveSurfer.create({
			container: ref.current,
			waveColor: '#f0f0f0',
			progressColor: '#007bff',
			barWidth: 2,
			barHeight: 1,
			cursorWidth: 0,
			height: 20,
			normalize: true,
			hideScrollbar: true,
			backend: 'MediaElement',
			// media: blobUrl,
			// Set a bar width

			// Optionally, specify the spacing between bars
			barGap: 1,
			// And the bar radius
			barRadius: 2

			// plugins: [WaveSurfer.cursor.create({ showTime: true })]
		});

		wavesurfer.load(audio.src);
		return () => {
			wavesurfer.destroy();
		};
	}, [{}]);

	return (
		<>
			<div className="element" ref={ref} />
		</>
	);
}
