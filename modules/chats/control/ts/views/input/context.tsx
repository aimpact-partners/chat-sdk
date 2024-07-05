import React from 'react';

export interface IInputContext {
	store: any;
	onSubmit: (message: any) => void;
	recorder: any;
	recording: any;
	disabled?: boolean;
	fetching?: boolean;
	setRecording: (recording: boolean) => void;
}
export const InputContext = React.createContext(null as IInputContext);
export const useInputContext = () => React.useContext(InputContext);
