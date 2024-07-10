import { Input } from 'pragmate-ui/form';
import React from 'react';
import type { Recorder } from '../../store/recorder';
import type { StoreManager } from '../../store';

export interface IInputContext {
	store: StoreManager;
	onSubmit: (message: any) => void;
	recorder: Recorder;
	recording: any;
	disabled?: boolean;
	fetching?: boolean;
	setRecording: (recording: boolean) => void;
	setFetching: (recording: boolean) => void;
	autoTranscribe: boolean;
	text?: string;
	setText: (text: string) => void;
}
export const InputContext = React.createContext(null as IInputContext);
export const useInputContext = () => React.useContext(InputContext);
