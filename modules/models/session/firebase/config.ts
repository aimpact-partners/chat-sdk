// Import the functions you need from the SDKs you need
import config from '@aimpact/chat-sdk/config';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { FacebookAuthProvider, getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const DEV = {
	apiKey: 'AIzaSyBYiZcPNBky2QvNdVwgCgU_v2B7feLtbQU',
	authDomain: 'aimpact-partners-dev.firebaseapp.com',
	databaseURL: 'https://aimpact-partners-dev-default-rtdb.firebaseio.com',
	projectId: 'aimpact-partners-dev',
	storageBucket: 'aimpact-partners-dev.appspot.com',
	messagingSenderId: '1081434267674',
	appId: '1:1081434267674:web:9396cc23e55385b5d171a3',
	measurementId: 'G-QLL5WFH89Y'
};
const BETA = {
	apiKey: 'AIzaSyAEEozzwR0cguqynxvL1qB38i8liOCgtJc',
	authDomain: 'aimpact-partners-prod.firebaseapp.com',
	projectId: 'aimpact-partners-prod',
	storageBucket: 'aimpact-partners-prod.appspot.com',
	messagingSenderId: '741854278426',
	appId: '1:741854278426:web:9ff2a50e705edcc501f2a3'
};
const CONFIG = {
	local: DEV,
	development: DEV,
	testing: {
		apiKey: 'AIzaSyDiwwiF_O_WZHyq7QrjnxqIg9EXz1vavV0',
		authDomain: 'chat-api-test-393820.firebaseapp.com',
		projectId: 'chat-api-test-393820',
		storageBucket: 'chat-api-test-393820.appspot.com',
		messagingSenderId: '1083395329827',
		appId: '1:1083395329827:web:c6fead0e2d4124b4f90696'
	},
	quality: BETA,
	production: BETA
};

// Initialize Firebase

const app = initializeApp(CONFIG[config.environment]);

export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
