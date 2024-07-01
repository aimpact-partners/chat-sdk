import React from 'react';
import { StoreManager } from './store';

export interface IProfileContext {
	texts: any;
	store: StoreManager;
	accessibility?: boolean;
}
export const ProfileContext = React.createContext({} as IProfileContext);
export const useProfileContext = () => React.useContext(ProfileContext);
