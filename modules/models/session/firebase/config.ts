// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfigTesting = {
	apiKey: 'AIzaSyDiwwiF_O_WZHyq7QrjnxqIg9EXz1vavV0',
	authDomain: 'chat-api-test-393820.firebaseapp.com',
	projectId: 'chat-api-test-393820',
	storageBucket: 'chat-api-test-393820.appspot.com',
	messagingSenderId: '1083395329827',
	appId: '1:1083395329827:web:c6fead0e2d4124b4f90696',
};
const firebaseConfig = {
	apiKey: 'AIzaSyBYiZcPNBky2QvNdVwgCgU_v2B7feLtbQU',
	authDomain: 'aimpact-partners-dev.firebaseapp.com',
	databaseURL: 'https://aimpact-partners-dev-default-rtdb.firebaseio.com',
	projectId: 'aimpact-partners-dev',
	storageBucket: 'aimpact-partners-dev.appspot.com',
	messagingSenderId: '1081434267674',
	appId: '1:1081434267674:web:9396cc23e55385b5d171a3',
	measurementId: 'G-QLL5WFH89Y',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
