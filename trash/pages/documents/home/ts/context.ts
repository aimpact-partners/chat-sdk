import React from 'react';
import type { StoreManager } from './store';
export interface IUploadContext {
	openDialog?: (name: string, knowledgeBox?: any) => void;
	closeDialog?: () => void;
	knowledgeBox?: any;
	setKnowledgeBox?: (kb: any) => void;
	store: StoreManager;
	totalItems: 0;
	texts: any;
}
export const UploadContext = React.createContext({} as IUploadContext);
export const useUploadContext = () => React.useContext(UploadContext);
