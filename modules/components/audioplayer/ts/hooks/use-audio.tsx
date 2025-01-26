import React from 'react';
import { IAudioInterface } from '../types/IAudioInterface';
import { getAudioContext } from './get-element-context';

type Response = {
	ready: boolean;
	audio: HTMLAudioElement;
	buffer: AudioBuffer;
	audioRef: React.MutableRefObject<HTMLAudioElement>;
	data: IAudioInterface;
	error: boolean;
};

export function useAudio(src, convert): Response {
	const audioRef = React.useRef(null);
	const [audio, setAudio] = React.useState<Response['audio']>(null);
	const [buffer, setBuffer] = React.useState<AudioBuffer>();
	const [ready, setReady] = React.useState<boolean>();
	const [data, setData] = React.useState<IAudioInterface>({ src });
	const [error, setError] = React.useState<boolean>(false);
	const ref = audioRef.current;

	React.useEffect(() => {
		try {
			const isBlob = src instanceof Blob;
			if (!isBlob) {
				return;
			}

			const audio = new Audio();

			const onLoadMetadata = () => {
				data.duration = parseFloat(audio.duration.toFixed(2));
				//@ts-ignore
				data.fileName = src.name;
				setData(data);
				setAudio(audio);
				getAudioContext(src).then(() => {
					setReady(true);
				});
			};
			const onError = error => {
				console.warn('error', error);
				setError(true);
			};
			audio.addEventListener('loadedmetadata', onLoadMetadata);
			audio.addEventListener('error', onError);
			audio.src = URL.createObjectURL(src);
			audio.load();

			return;
		} catch (e) {
			console.error('capturado', e.message);
			setError(true);
		}
	}, [src]);

	return {
		ready,
		audioRef: ref,
		buffer,
		audio,
		data,
		error
	};
}
