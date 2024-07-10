import {useContext, createContext} from 'react';
import {IAudioInterface} from './types/IAudioInterface';

interface IAudioContext {
	audio?: HTMLAudioElement;
	data?: IAudioInterface;
	buffer?: AudioBuffer;
	playing: boolean;
	setPlaying: (value: boolean) => void;
	currentTime: number;
	setCurrentTime: (value: number) => void;
}
export const ComponentAudioContext = createContext({} as IAudioContext);
export const useComponentAudioContext = () => useContext(ComponentAudioContext);
