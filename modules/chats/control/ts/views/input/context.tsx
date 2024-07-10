import { Input } from 'pragmate-ui/form';
import React from 'react';
import type { Recorder } from '../../store/recorder';

export interface IInputContext {
	store: any;
	onSubmit: (message: any) => void;
	recorder: Recorder;
	recording: any;
	disabled?: boolean;
	fetching?: boolean;
	setRecording: (recording: boolean) => void;
}
export const InputContext = React.createContext(null as IInputContext);
export const useInputContext = () => React.useContext(InputContext);
