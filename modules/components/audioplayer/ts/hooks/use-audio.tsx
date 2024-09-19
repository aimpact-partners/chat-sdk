import React from 'react';
import { IAudioInterface } from '../types/IAudioInterface';
import { PendingPromise } from '@beyond-js/kernel/core';
import WaveSurfer from 'wavesurfer.js';
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

	// const getAudioContext = element => {
	// 	return new Promise((resolve, reject) => {
	// 		const audioContext = new AudioContext();
	// 		const reader = new FileReader();
	// 		reader.onload = () => {
	// 			const buffer = reader.result as ArrayBuffer;
	// 			audioContext
	// 				.decodeAudioData(buffer)
	// 				.then(buffer => {
	// 					resolve(audioContext);
	// 					setData({ ...data, duration: parseFloat(buffer.duration.toFixed(2)) });
	// 					setBuffer(buffer);
	// 				})
	// 				.catch(error => {
	// 					reject(error);
	// 				});
	// 		};
	// 		reader.readAsArrayBuffer(element);
	// 	});
	// };
	React.useEffect(() => {
		try {
			const isBlob = src instanceof Blob;
			if (!isBlob) {
				return;
			}

			const audio = new Audio();
			const contextCallback = buffer => {
				resolve(audioContext);
				setData({ ...data, duration: parseFloat(buffer.duration.toFixed(2)) });
				setBuffer(buffer);
			};
			
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
