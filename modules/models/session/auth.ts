import { User } from '@aimpact/chat-sdk/users';
import { auth, googleProvider } from './firebase/config';

import {
	signOut,
	signInWithPopup,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	sendPasswordResetEmail,
	verifyPasswordResetCode,
	confirmPasswordReset,
	UserCredential
} from 'firebase/auth';
import { PendingPromise } from '@beyond-js/kernel/core';

interface IAuthResult {
	status: boolean;
	error?: string;
	user?: User; // or whatever the type of your User object is
}

export class Auth {
	#uid: string;
	#pendingLogin;

	appLogin = async (response: UserCredential) => {
		if (response.user?.uid) {
			if (this.#uid === response.user.uid) return;
			this.#uid = response.user.uid;
			if (this.#pendingLogin) return this.#pendingLogin;
			this.#pendingLogin = new PendingPromise();

			const { displayName, photoURL, email, phoneNumber, uid } = response.user;

			const firebaseToken = await response.user.getIdToken();
			const specs = { id: uid, displayName, photoURL, email, phoneNumber, firebaseToken };
			const user = new User(specs);
			user.set(specs, true);

			user.login(firebaseToken).then(couldLog => {
				if (!couldLog) {
					console.error('Could not login', couldLog);
				}
				this.#pendingLogin.resolve({ status: true, user });
			});
			return this.#pendingLogin;
		}
		return { status: false, error: 'INVALID_USER' };
	};

	signInWithGoogle = async () => {
		try {
			const response = await signInWithPopup(auth, googleProvider);
			//const response = await signInWithRedirect(auth, googleProvider);
			return await this.appLogin(response);
		} catch (error) {
			const errors = {
				'auth/account-exists-with-different-credential': 'ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL',
				'auth/popup-closed-by-user': 'POPUP_CLOSED_BY_USER'
			};

			return { status: false, error: errors[error.code] || 'CANNOT' };
		}
	};

	registerWithEmail = async (email: string, password: string, username: string) => {
		try {
			const response = await createUserWithEmailAndPassword(auth, email, password);
			const userWithDisplayName = { ...response.user, displayName: username };

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
