import { initializeApp } from 'firebase/app';
//your code here
interface IFirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
	measurementId: string;
}

let app;
export /*bundle */ const initialize = (settings: IFirebaseConfig) => {
	app = initializeApp(settings);
	return app;
};

export /*bundle */ const getApp = () => {
	if (app) return app;
	throw new Error('Firebase app not initialized');
};
