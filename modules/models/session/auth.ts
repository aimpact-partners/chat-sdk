import { User } from '@aimpact/chat-sdk/users';
import { auth, googleProvider } from './firebase/config';
import { TokenManager } from './token';

import {
	signOut,
	signInWithPopup,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	verifyPasswordResetCode,
	confirmPasswordReset,
	UserCredential,
} from 'firebase/auth';

interface IAuthResult {
	status: boolean;
	error?: string;
	user?: User; // or whatever the type of your User object is
}

export class Auth {
	static async login(email: string, password: string): Promise<User> {
		const userCredential = await auth().signInWithEmailAndPassword(email, password);
		const user = new User(userCredential.user.uid, userCredential.user.displayName, userCredential.user.email);

		const token = await TokenManager.getToken(user);
		await TokenManager.storeToken(token, user);

		return user;
	}

	appLogin = async (response: UserCredential): Promise<IAuthResult> => {
		if (response.user?.uid) {
			const { displayName, photoURL, email, phoneNumber, uid } = response.user;
			const firebaseToken = await response.user.getIdToken();
			const specs = { id: uid, displayName, photoURL, email, phoneNumber, firebaseToken };

			const user = new User(specs);
			user.set(specs);

			const couldLog = await user.login(response);

			if (!couldLog) {
				console.error('Could not login', couldLog);
			}
			return { status: true, user };
		}
		return { status: false, error: 'INVALID_USER' };
	};

	signInWithGoogle = async (): Promise<IAuthResult> => {
		try {
			const response = await signInWithPopup(auth, googleProvider);
			//const response = await signInWithRedirect(auth, googleProvider);
			return await this.appLogin(response);
		} catch (error) {
			const errors = {
				'auth/account-exists-with-different-credential': 'ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL',
				'auth/popup-closed-by-user': 'POPUP_CLOSED_BY_USER',
			};

			return { status: false, error: errors[error.code] || 'CANNOT' };
		}
	};

	registerWithEmail = async (email: string, password: string, userName: string) => {
		try {
			const response = await createUserWithEmailAndPassword(auth, email, password);
			const userWithDisplayName = { ...response.user, displayName: userName };

			return await this.appLogin({ ...response, user: userWithDisplayName });
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	resetPassword = async (email: string) => {
		try {
			await sendPasswordResetEmail(auth, email);
			return { status: true };
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	confirmPasswordReset = async (code: string, newPassword: string) => {
		try {
			await verifyPasswordResetCode(auth, code);
			await confirmPasswordReset(auth, code, newPassword);
			return { status: true };
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	login = async (email: string, password: string) => {
		try {
			const response = await signInWithEmailAndPassword(auth, email, password);
			return await this.appLogin(response);
		} catch (error) {
			return { status: false, error: error.message };
		}
	};

	signOut = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error(error);
		}
	};
	logout = this.signOut;
}
