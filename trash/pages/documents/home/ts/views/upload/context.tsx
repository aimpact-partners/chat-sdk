import React from 'react';

export interface IContext {
	deleteFile?: (name: string) => void;
	clearFiles?: () => void;
	files?: Map<string, File>;
	uploadFiles?: (files: File[]) => void;
	button?: any;
	totalFiles?: number;
	drag?: any;
}
export const UploaderModalContext = React.createContext({} as IContext);
export const useUploaderModalContext = () => React.useContext(UploaderModalContext);
